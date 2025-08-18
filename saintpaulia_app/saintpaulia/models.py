from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from saintpaulia_app.database import Base
from saintpaulia_app.saintpaulia.schemas import VerificationResponse
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from saintpaulia_app.photos.models import UploadedPhoto


class Saintpaulia(Base):
    __tablename__ = "saintpaulia_varieties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Загальні параметри
    size_category = Column(String, nullable=False)  # стандарт, напівміні, міні
    growth_type = Column(String, nullable=True)  # тип росту: одиночна розетка (стандарт, single-crowned), багатокоронна (multi-crowned), ампельна (trailing)
    # Параметри квітки  
    main_flower_color = Column(String, nullable=True)
    flower_color_type = Column(String, nullable=True)  # чи це квіткова химера 
    flower_edge_color = Column(String, nullable=True)  # колір облямівки квітки
    ruffles = Column(String, nullable=True) # гофрованість, хвилястьсть, рюші 
    ruffles_color = Column(String, nullable=True)
    flower_colors_all = Column(Text, nullable=True)  # JSON або текстовий опис кольорів квітки
    flower_size = Column(String, nullable=True)
    flower_shape = Column(String, nullable=True)
    petals_shape = Column(String, nullable=True)  # форма пелюсток 
    flower_doubleness = Column(String, nullable=True)  # проста, напівмахрова, махрова
    blooming_features = Column(Text, nullable=True)
    # Параметри листя 
    leaf_shape = Column(String, nullable=True)
    leaf_variegation = Column(String, nullable=True)  # варіації листя
    leaf_color_type = Column(String, nullable=True)  # чи це листова химера 
    leaf_features = Column(Text, nullable=True)  # особливості листя 

    # Додаткові поля
    photos = relationship(
        "UploadedPhoto",
        back_populates="variety",
        primaryjoin="Saintpaulia.id == foreign(UploadedPhoto.variety_id)"
    )
    # photos = relationship("UploadedPhoto", back_populates="variety")
    origin = Column(String, nullable=True) # походження сорту
    breeder = Column(String, nullable=True)
    breeder_origin_country = Column(String, nullable=True)  # країна походженя селекціонера
    selection_year = Column(Integer, nullable=True)
    data_source = Column(String, nullable=True)  # джерело даних про сорт 

    #дані про того, хто вніс запис
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="saintpaulias", foreign_keys=[owner_id])
    record_creation_date = Column(DateTime(timezone=True), default=func.now())
    
    # soft delete
    is_deleted = Column(Boolean, default=False)  # soft delete

    # Верифікація сорту
    verification_status = Column(
        Boolean,
        nullable=False,
        server_default=text('false'),  # DB-level default
        default=False                  # Python-side default
        )
    verification_note = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verification_date = Column(DateTime(timezone=True), nullable=True)

    # Зв’язок із користувачем-верифікатором
    verifier = relationship("User", back_populates="verified_varieties", foreign_keys=[verified_by])
    
    @property
    def verification(self) -> VerificationResponse:
        return VerificationResponse(
            verification_status="verified" if self.verification_status else "unverified",
            # verified_by=(self.verifier.username if getattr(self, "verifier", None) else None),
            verified_by=self.verified_by,
            verification_date=self.verification_date,
            verification_note=(self.verification_note or "")
        )
    
    def __str__(self):
        return f"Saintpaulia(id={self.id}, name='{self.name}')"

    def __repr__(self):
        return (
            f"<Saintpaulia(id={self.id}, name='{self.name}', "
            f"owner_id={self.owner_id}, verification_status={self.verification_status})>"
        )
    

class SaintpauliaLog(Base):
    __tablename__ = "saintpaulia_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)  # e.g., 'create', 'update', 'delete'
    # variety_id = Column(Integer, ForeignKey("saintpaulia_varieties.id"), nullable=False) # для зв'язку з сортом - але це блокує видалення сорту, тому що на нього посилаються
    variety_id = Column(Integer)  # для зв'язку з сортом, але вже без посилання на ForeignKey 
    variety_name = Column(String)  # для зручності
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # variety = relationship("Saintpaulia", backref="saintpaulia_logs")
    user = relationship("User", backref="saintpaulia_logs")


from saintpaulia_app.photos.models import UploadedPhoto 