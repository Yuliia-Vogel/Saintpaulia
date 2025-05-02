from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    user = "user"
    expert = "expert"
    breeder = "breeder"
    admin = "admin"
    superadmin = "superadmin"


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.user


class UserRead(UserBase):
    id: int
    is_active: bool
    role: UserRole

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str
