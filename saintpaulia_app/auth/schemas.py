from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    user = "user"
    expert = "expert"
    breeder = "breeder"
    admin = "admin"
    superadmin = "superadmin"


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: constr(min_length=8)
    role: UserRole = UserRole.user


class UserRead(UserBase):
    id: int
    is_active: bool
    role: UserRole
    confirmed: bool

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str



class RequestEmail(BaseModel):
    email: EmailStr


class RequestPasswordReset(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: constr(min_length=8)


class UserShortInfo(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    email: EmailStr
    # first_name: Optional[str]
    # last_name: Optional[str]
    role: str
    is_active: bool
    is_superuser: bool
    confirmed: bool

    class Config:
        orm_mode = True
