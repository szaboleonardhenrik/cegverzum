from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models.module import Module, UserModule
from app.models.user import User
from app.schemas.module import ModuleRead, UserModuleRead
from app.auth import hash_password
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserPackageUpdate, UserCreateFull

router = APIRouter(prefix="/admin", tags=["admin"])


def _user_to_read(user: User) -> UserRead:
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


# ── All users (admin + partners) ─────────────────────────────


@router.get("/users", response_model=list[UserRead])
def list_all_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.id).all()
    return [_user_to_read(u) for u in users]


@router.post("/users", response_model=UserRead, status_code=201)
def create_user(data: UserCreateFull, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ez az email cím már létezik")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password) if data.password else None,
        is_admin=data.is_admin,
        is_active=True,
        package=data.package,
        monthly_price=data.monthly_price,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


# ── Partner management ──────────────────────────────────────────


@router.get("/partners", response_model=list[UserRead])
def list_partners(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    users = db.query(User).filter(User.is_admin == False).all()
    return [_user_to_read(u) for u in users]


@router.post("/partners", response_model=UserRead, status_code=201)
def invite_partner(data: UserCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ez az email cím már létezik")
    user = User(email=data.email, is_admin=False, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


@router.patch("/partners/{user_id}/deactivate", response_model=UserRead)
def deactivate_partner(user_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user or user.is_admin:
        raise HTTPException(status_code=404, detail="Partner nem található")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


@router.patch("/partners/{user_id}/activate", response_model=UserRead)
def activate_partner(user_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user or user.is_admin:
        raise HTTPException(status_code=404, detail="Partner nem található")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


# ── Full user update ──────────────────────────────────────────


@router.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    updates = data.model_dump(exclude_unset=True)
    if "email" in updates and updates["email"] != user.email:
        existing = db.query(User).filter(User.email == updates["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ez az email cím már létezik")
    if "is_admin" in updates and user.id == admin.id:
        raise HTTPException(status_code=400, detail="Saját szerepkört nem változtathatja meg")
    for field, value in updates.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


# ── User package management ───────────────────────────────────


@router.patch("/users/{user_id}/package", response_model=UserRead)
def update_user_package(
    user_id: int,
    data: UserPackageUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    user.package = data.package
    user.monthly_price = data.monthly_price
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


@router.patch("/users/{user_id}/role", response_model=UserRead)
def toggle_user_role(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Saját szerepkört nem változtathatja meg")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


# ── Delete user ──────────────────────────────────────────────────


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Saját fiókot nem törölheti")
    # Remove related user-modules first
    db.query(UserModule).filter(UserModule.user_id == user_id).delete()
    db.delete(user)
    db.commit()


# ── Module management ───────────────────────────────────────────


@router.get("/modules", response_model=list[ModuleRead])
def list_modules(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return db.query(Module).order_by(Module.id).all()


@router.patch("/modules/{module_id}", response_model=ModuleRead)
def toggle_module(module_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Modul nem található")
    module.is_active = not module.is_active
    db.commit()
    db.refresh(module)
    return module


@router.get("/users/{user_id}/modules", response_model=list[UserModuleRead])
def list_user_modules(user_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    modules = db.query(Module).order_by(Module.id).all()
    result = []
    for m in modules:
        um = db.query(UserModule).filter(UserModule.user_id == user_id, UserModule.module_id == m.id).first()
        result.append(UserModuleRead(
            id=um.id if um else 0,
            user_id=user_id,
            module_id=m.id,
            module_slug=m.slug,
            module_name=m.display_name,
            is_active=um.is_active if um else False,
        ))
    return result


@router.patch("/users/{user_id}/modules/{module_id}", response_model=UserModuleRead)
def toggle_user_module(user_id: int, module_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Modul nem található")

    um = db.query(UserModule).filter(UserModule.user_id == user_id, UserModule.module_id == module_id).first()
    if um:
        um.is_active = not um.is_active
        if um.is_active:
            um.activated_at = datetime.now(timezone.utc)
    else:
        um = UserModule(user_id=user_id, module_id=module_id, is_active=True, activated_at=datetime.now(timezone.utc))
        db.add(um)

    db.commit()
    db.refresh(um)
    return UserModuleRead(
        id=um.id,
        user_id=user_id,
        module_id=module_id,
        module_slug=module.slug,
        module_name=module.display_name,
        is_active=um.is_active,
    )
