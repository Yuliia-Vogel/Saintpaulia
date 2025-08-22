# backend/app/routers/contact.py
import os
from fastapi import APIRouter
from pydantic import BaseModel
from saintpaulia_app.models import ContactInfo

router = APIRouter()

@router.get("/contact-info", response_model=ContactInfo)
async def get_contact_info():
    return {
        "email": os.getenv("CONTACT_EMAIL", "default@example.com"),
        "phone": os.getenv("CONTACT_PHONE", None),
    }
