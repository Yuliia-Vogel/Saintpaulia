from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from saintpaulia_app.database import Base


class Saintpaulia(Base):
    __tablename__ = "saintpaulia_varieties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Загальні параметри
    size_category = Column(String, nullable=False)  # стандарт, напівміні, міні

    flower_color = Column(String, nullable=True)
    flower_size = Column(String, nullable=True)
    flower_shape = Column(String, nullable=True)
    flower_doubleness = Column(String, nullable=True)  # проста, напівмахрова, махрова
    ruffles = Column(Boolean, nullable=True) # наявність рюшів
    ruffles_color = Column(String, nullable=True)
    blooming_features = Column(Text, nullable=True)

    leaf_shape = Column(String, nullable=True)
    leaf_variegation = Column(String, nullable=True)  # варіації листя

    # Додаткові поля
    photos = relationship("UploadedPhoto", back_populates="variety", cascade="all, delete")
    origin = Column(String, nullable=True) # походження сорту
    selectionist = Column(String, nullable=True)
    selection_year = Column(Integer, nullable=True)

    #дані про того, хто вніс запис
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="saintpaulias", foreign_keys=[owner_id])
    record_creation_date = Column(DateTime(timezone=True), default=func.now())
    
    # soft delete
    is_deleted = Column(Boolean, default=False)  # soft delete

    # верифікація сорту 
    is_verified = Column(Boolean, default=False)
    verification_note = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verifier = relationship("User", back_populates="verified_varieties", foreign_keys=[verified_by])
    verification_date = Column(DateTime(timezone=True), nullable=True)

    @property
    def verification(self):
        if self.verification_date is None and self.verified_by is None:
            return None
        return {
            "is_verified": self.is_verified,
            "verified_by": self.verified_by,
            "verification_date": self.verification_date,
            "verification_note": self.verification_note,
        }


class SaintpauliaLog(Base):
    __tablename__ = "saintpaulia_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)  # e.g., 'create', 'update', 'delete'
    variety_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="saintpaulia_logs")
