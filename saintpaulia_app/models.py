from pydantic import BaseModel

class ContactInfo(BaseModel):
    email: str
    phone: str | None = None