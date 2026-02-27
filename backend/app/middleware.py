import time

from jose import jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import settings
from app.database import SessionLocal
from app.models.request_log import RequestLog


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        # Best-effort user_id extraction from JWT
        user_id = None
        try:
            auth = request.headers.get("authorization", "")
            if auth.startswith("Bearer "):
                token = auth[7:]
                payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
                user_id = int(payload.get("sub"))
        except Exception:
            pass

        try:
            db = SessionLocal()
            log = RequestLog(
                method=request.method,
                path=request.url.path[:500],
                status_code=response.status_code,
                response_time_ms=round(elapsed_ms, 2),
                user_id=user_id,
                ip=request.client.host if request.client else None,
                user_agent=(request.headers.get("user-agent") or "")[:500] or None,
            )
            db.add(log)
            db.commit()
        except Exception:
            pass
        finally:
            db.close()

        return response
