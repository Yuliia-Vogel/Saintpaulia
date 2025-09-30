from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
# from saintpaulia_app.photos.schemas import PhotoResponse
# from saintpaulia_app.photos.service import process_photo_upload as service

router = APIRouter(tags=["Photos"])

