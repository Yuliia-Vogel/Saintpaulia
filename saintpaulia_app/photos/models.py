
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from saintpaulia_app.database import Base
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from saintpaulia_app.saintpaulia.models import Saintpaulia
    from saintpaulia_app.auth.models import User

class UploadedPhoto(Base):
    __tablename__ = "uploaded_photos"

    id = Column(Integer, primary_key=True, index=True)
    file_url = Column(String, nullable=False)
    public_id = Column(String, nullable=False)  # для видалення з Cloudinary
    variety_id = Column(Integer)  # для зв'язку з сортом
    # variety = relationship("Saintpaulia", primaryjoin="UploadedPhoto.variety_id==Saintpaulia.id", viewonly=True)
    variety = relationship(
        "Saintpaulia",
        primaryjoin="foreign(UploadedPhoto.variety_id) == Saintpaulia.id",
        back_populates="photos",
        remote_side="Saintpaulia.id", # показую, що Saintpaulia.id є "віддаленим ключем" у зв’язку MANY-TO-ONE (але вже без ForeignKey))
    )
    # variety_id = Column(Integer, ForeignKey("saintpaulia_varieties.id", ondelete="SET NULL"), nullable=True)
    # variety = relationship("Saintpaulia", back_populates="photos")
    uploaded_at = Column(DateTime, default=func.now())
    
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="uploaded_photos")


class PhotoLog(Base):
    __tablename__ = "photo_logs"

    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, ForeignKey("uploaded_photos.id"))
    # variety_id = Column(Integer, ForeignKey("saintpaulia_varieties.id", ondelete="SET NULL"), nullable=True)
    variety_id = Column(Integer)  # для зв'язку з сортом, але вже без посилання на ForeignKey 
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)  # 'upload', 'delete'
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    photo = relationship("UploadedPhoto")
    # variety = relationship("Saintpaulia", backref="photo_logs")


from saintpaulia_app.saintpaulia.models import Saintpaulia
from saintpaulia_app.auth.models import User