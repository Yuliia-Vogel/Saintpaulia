from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    user = "user"
    expert = "expert"
    breeder = "breeder"
    admin = "admin"
    superadmin = "superadmin"


class UserRoleUpdate(BaseModel):
    role: UserRole


# Базова схема для створення та читання користувача 
class UserBase(BaseModel):
    email: EmailStr
    # first_name: Optional[str] = None
    # last_name: Optional[str] = None прізвище та ім"я поки не треба при реєстрації, це можна додати пізніше


# Схема для створення нового користувача
class UserCreate(UserBase):
    password: constr(min_length=8)
    # role: UserRole = UserRole.user # це тут непотрібно, бо роль за замовчуванням user


# Схема для оновлення профілю самим користувачем
class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


# Схема для читання інформації про користувача (без пароля)
class UserRead(UserBase):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    user_creation_date: datetime # Дата створення, встановлюється автоматично
    confirmed: bool
    email_confirmed_at: Optional[datetime] # Дата підтвердження email, встановлюється автоматично при підтвердженні емейлу 
    phone_number: Optional[str] = None 
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    role: UserRole
    

    class Config:
        from_attributes = True


# Схеми для автентифікації та відновлення пароля
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


class UserMeResponse(UserRead):
    varieties_number: int


class UserOut(BaseModel): # де це використовується?
    id: int
    email: EmailStr
    # first_name: Optional[str]
    # last_name: Optional[str]
    role: str
    is_active: bool
    is_superuser: bool
    confirmed: bool

    class Config:
        from_attributes = True
