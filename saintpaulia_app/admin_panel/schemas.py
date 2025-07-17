# admin_panel/schemas.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserShortInfo(BaseModel):
    id: int
    email: EmailStr
    confirmed: bool
    role: str

    class Config:
        from_attributes = True
   

class SaintpauliaShortInfo(BaseModel):
    id: int
    name: str
    is_verified: bool
    record_creation_date: datetime
    owner_id: int

    class Config:
        from_attributes = True


class UserVarietiesResponse(BaseModel):
    user: UserShortInfo
    varieties: List[SaintpauliaShortInfo]
