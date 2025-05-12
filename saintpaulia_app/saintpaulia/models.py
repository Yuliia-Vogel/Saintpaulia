from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from saintpaulia_app.database import Base


class Saintpaulia(Base):
    __tablename__ = "saintpaulia_varieties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, default="дані ще не внесено")

    # Загальні параметри
    size_category = Column(String, nullable=False)  # стандарт, напівміні, міні
    flower_color = Column(String, nullable=False, default="дані ще не внесено")
    flower_size = Column(String, nullable=False, default="дані ще не внесено")
    flower_shape = Column(String, default="дані ще не внесено")
    flower_doubleness = Column(String, nullable=False, default="дані ще не внесено")  # проста, напівмахрова, махрова

    leaf_shape = Column(String, default="дані ще не внесено")
    leaf_variegation = Column(String, default="дані ще не внесено")

    # Додаткові поля
    photos = relationship("UploadedPhoto", back_populates="variety", cascade="all, delete")
    origin = Column(String, default="дані ще не внесено") # походження сорту
    selectionist = Column(String, nullable=False, default="дані ще не внесено")
    selection_year = Column(Integer, nullable=True)
    blooming_features = Column(Text, default="дані ще не внесено")

    #дані про того, хто вніс запис
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    record_creation_date = Column(DateTime, default=func.now())
    
    # soft delete
    is_deleted = Column(Boolean, default=False)  


class SaintpauliaLog(Base):
    __tablename__ = "saintpaulia_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)  # e.g., 'create', 'update', 'delete'
    variety_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="saintpaulia_logs")
