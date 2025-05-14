from pydantic import BaseModel
from datetime import datetime


class PhotoCreate(BaseModel):
    file_url: str
    public_id: str
    variety_id: int
    uploaded_by: int


class PhotoResponce(BaseModel):
    id: int
    file_url: str
    public_id: str
    uploaded_at: datetime
    uploaded_by: int  

    class Config:
        from_attributes = True
