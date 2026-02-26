from datetime import datetime

from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    is_admin: bool
    is_active: bool
    has_registered: bool = False
    package: str = "free"
    monthly_price: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    package: Optional[str] = None
    monthly_price: Optional[int] = None


class UserPackageUpdate(BaseModel):
    package: str
    monthly_price: int


class UserCreateFull(BaseModel):
    email: EmailStr
    full_name: str | None = None
    password: str | None = None
    is_admin: bool = False
    package: str = "free"
    monthly_price: int = 0


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
