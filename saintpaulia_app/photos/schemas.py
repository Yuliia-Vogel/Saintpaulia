from pydantic import BaseModel, EmailStr
from datetime import datetime


class PhotoCreate(BaseModel):
    file_url: str
    public_id: str
    variety_id: int
    uploaded_by: int


class PhotoResponse(BaseModel):
    id: int
    file_url: str
    public_id: str
    uploaded_at: datetime
    uploaded_by: int 

    class Config:
        from_attributes = True

# розширена схема:
# щоб повертати не просто сирі дані з таблиці, а також супровідну інформацію, наприклад, email користувача, 
# який завантажував фото, і, можливо, ім'я файлу чи URL
class PhotoLogEntry(BaseModel):
    id: int
    action: str
    timestamp: datetime
    photo_id: int
    photo_filename: str  # беремо з UploadedPhoto.file_url
    user_email: EmailStr  # беремо з User.email

    class Config:
        from_attributes = True


class PhotoLogFull(BaseModel):
    id: int
    action: str
    timestamp: datetime
    photo_id: int
    photo_filename: str
    user_email: EmailStr

    class Config:
        from_attributes = True