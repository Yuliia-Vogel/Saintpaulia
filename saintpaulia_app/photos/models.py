from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from saintpaulia_app.database import Base


class UploadedPhoto(Base):
    __tablename__ = "uploaded_photos"

    id = Column(Integer, primary_key=True, index=True)
    file_url = Column(String, nullable=False)
    public_id = Column(String, nullable=False)  # для видалення з Cloudinary
    variety_id = Column(Integer, ForeignKey("saintpaulia_varieties.id"), nullable=False)
    uploaded_at = Column(DateTime, default=func.now())
    
    variety = relationship("Saintpaulia", back_populates="photos")
    
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="uploaded_photos")
