import json
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.chat import ChatMessage
from app.models.user import User
from app.services.chat_service import find_company_context, stream_response

router = APIRouter(prefix="/chat", tags=["chat"])

# ── Guest rate limiting (3 messages/day/IP) ──────────────────
_guest_limits: dict[str, dict] = {}


def _check_guest_rate_limit(request: Request):
    ip = request.client.host
    today = date.today().isoformat()
    entry = _guest_limits.get(ip, {})
    if entry.get("date") != today:
        _guest_limits[ip] = {"date": today, "count": 0}
    if _guest_limits[ip]["count"] >= 3:
        raise HTTPException(
            status_code=429,
            detail="Napi üzenetkorlát elérve (3/3). Jelentkezz be a korlátlan használathoz!",
        )
    _guest_limits[ip]["count"] += 1


class ChatRequest(BaseModel):
    message: str


def _get_optional_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Return current user if logged in, None otherwise."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        return None
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        return None
    return user


@router.post("")
def send_message(
    request: Request,
    body: ChatRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(_get_optional_user),
):
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="AI chat nincs konfigurálva")

    # Rate limit guests
    if user is None:
        _check_guest_rate_limit(request)

    message_text = body.message.strip()
    if not message_text:
        raise HTTPException(status_code=400, detail="Üres üzenet")

    # Find company context from the current message
    company, context = find_company_context(message_text, db)

    # Save user message if logged in
    if user:
        user_msg = ChatMessage(
            user_id=user.id,
            role="user",
            content=message_text,
            company_id=company.id if company else None,
        )
        db.add(user_msg)
        db.commit()

    # Load conversation history
    if user:
        history = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == user.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(20)
            .all()
        )
        history.reverse()
        messages = [{"role": msg.role, "content": msg.content} for msg in history]
    else:
        messages = [{"role": "user", "content": message_text}]

    # Stream response
    def event_stream():
        full_response = []
        try:
            for chunk in stream_response(messages, context):
                full_response.append(chunk)
                data = json.dumps({"type": "chunk", "content": chunk}, ensure_ascii=False)
                yield f"data: {data}\n\n"

            # Save assistant message if logged in
            if user:
                assistant_text = "".join(full_response)
                if assistant_text:
                    assistant_msg = ChatMessage(
                        user_id=user.id,
                        role="assistant",
                        content=assistant_text,
                        company_id=company.id if company else None,
                    )
                    db.add(assistant_msg)
                    db.commit()

            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(_get_optional_user),
):
    if not user:
        return []
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(50)
        .all()
    )
    messages.reverse()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "company_id": m.company_id,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.delete("/history", status_code=204)
def clear_history(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(_get_optional_user),
):
    if not user:
        return
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    db.commit()
