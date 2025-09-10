# admin_panel/schemas.py

from pydantic import BaseModel, EmailStr, Field
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
    verification_status: bool
    record_creation_date: datetime
    owner_id: int

    class Config:
        from_attributes = True


class UserVarietiesResponse(BaseModel):
    user: UserShortInfo
    varieties: List[SaintpauliaShortInfo]



class BulkActionRequest(BaseModel):
    variety_ids: List[int] = Field(..., min_items=1) # Очікуємо список ID, мінімум 1

