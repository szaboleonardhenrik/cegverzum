from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserRegister, UserRead, PasswordChange, Token
from app.services.email_service import notify_admins_new_registration

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Hibás email vagy jelszó")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="A fiók deaktiválva van")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Hibás email vagy jelszó")
    return Token(access_token=create_access_token(user))


@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ez az email cím nincs meghívva. Kérje az adminisztrátort.")
    if user.hashed_password is not None:
        raise HTTPException(status_code=400, detail="Már regisztrálva van. Kérjük, jelentkezzen be.")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="A jelszónak legalább 8 karakter hosszúnak kell lennie")
    user.hashed_password = hash_password(data.password)
    if data.full_name:
        user.full_name = data.full_name
    db.commit()

    # Notify admins about new registration (fire-and-forget)
    admin_emails = [
        a.email for a in db.query(User).filter(User.is_admin == True, User.is_active == True).all()
    ]
    if admin_emails:
        notify_admins_new_registration(user.email, user.full_name, admin_emails)

    return Token(access_token=create_access_token(user))


@router.get("/me", response_model=UserRead)
def get_me(user: User = Depends(get_current_user)):
    return UserRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_admin=user.is_admin,
        is_active=user.is_active,
        has_registered=user.hashed_password is not None,
        package=user.package or "free",
        monthly_price=user.monthly_price or 0,
        created_at=user.created_at,
    )


@router.patch("/password")
def change_password(data: PasswordChange, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.hashed_password or not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="A régi jelszó nem megfelelő")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Az új jelszónak legalább 8 karakter hosszúnak kell lennie")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Jelszó sikeresen megváltoztatva"}
