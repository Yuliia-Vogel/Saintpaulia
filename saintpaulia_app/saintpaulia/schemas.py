from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional, List
from datetime import datetime
from saintpaulia_app.photos.schemas import PhotoResponse 
from saintpaulia_app.auth.schemas import UserShortInfo, UserRead


# Для оновлення статусу (PUT/POST)
class VerificationUpdate(BaseModel):
    verification_status: bool
    verification_note: Optional[str] = None

# Для відповіді фронту — дружні поля
class VerificationResponse(BaseModel):
    verification_status: str              # "verified" / "unverified"
    verified_by: Optional[int] = None  # id користувача
    verification_date: Optional[datetime] = None
    verification_note: Optional[str] = ""


class SaintpauliaBase(BaseModel):
    name: str
    description: Optional[str] = None
    # Загальні параметри
    size_category: str
    growth_type: Optional[str] = None  # тип росту: одиночна розетка, багатокоронна, ампельна
    # Параметри квітки 
    main_flower_color: Optional[str] = None
    flower_color_type: Optional[str] = None  # чи це квіткова химера
    flower_edge_color: Optional[str] = None  # колір облямівки квітки
    ruffles: Optional[str] = None  # гофрованість, хвилястьсть, рюші
    ruffles_color: Optional[str] = None
    flower_colors_all: Optional[str] = None  # JSON або текстовий опис кольорів квітки
    flower_size: Optional[str] = None
    flower_shape: Optional[str] = None
    petals_shape: Optional[str] = None  # форма пелюсток
    flower_doubleness: Optional[str] = None  # проста, напівмахрова, махрова
    blooming_features: Optional[str] = None
    # Параметри листя 
    leaf_shape: Optional[str] = None
    leaf_variegation: Optional[str] = None
    leaf_color_type: Optional[str] = None  # чи це листова химера
    leaf_features: Optional[str] = None  # особливості листя
    # Додаткові поля 
    origin: Optional[str] = None
    breeder: Optional[str] = None
    breeder_origin_country: Optional[str] = None  # країна походженя селекціонера
    selection_year: Optional[int] = None
    data_source: Optional[str] = None  # джерело даних про сорт
    photo_source: Optional[str] = None  # джерело фото сорту
    is_deleted: bool = False  # цей прапорець необхідний для фронту, щоб показувати, що сорт в архіві

    @validator("selection_year", pre=True)
    def validate_selection_year(cls, value):
        if value in (None, ""):
            return None
        if isinstance(value, str):
            value = value.strip()
            if value.isdigit():
                value = int(value)
            else:
                raise ValueError("Рік селекції повинен бути числом.")
        if isinstance(value, float):
            value = int(value)
        if isinstance(value, int):
            current_year = datetime.now().year
            if value < 1892 or value > current_year:
                raise ValueError(f"Рік селекції має бути між 1892 і {current_year}.")
        return value

class SaintpauliaCreate(SaintpauliaBase):
    pass

class SaintpauliaResponse(SaintpauliaBase):
    id: int
    owner_id: int  # автозаповнення з авторизації
    record_creation_date: datetime
    photos: list[PhotoResponse] = Field(default_factory=list)  # список фоток сорту

    verification: VerificationResponse = Field(
        default_factory=lambda: VerificationResponse(
            verification_status="unverified",
            verified_by=None,
            verification_date=None,
            verification_note="")
    )

    class Config:
        from_attributes = True


class SaintpauliaUpdate(SaintpauliaBase):
    name: Optional[str] = None
    description: Optional[str] = None

    size_category: Optional[str] = None
    growth_type: Optional[str] = None
    
    main_flower_color: Optional[str] = None
    flower_color_type: Optional[str] = None 
    flower_edge_color: Optional[str] = None  
    ruffles: Optional[str] = None  
    ruffles_color: Optional[str] = None
    flower_colors_all: Optional[str] = None  
    flower_size: Optional[str] = None
    flower_shape: Optional[str] = None
    petals_shape: Optional[str] = None  
    flower_doubleness: Optional[str] = None  
    blooming_features: Optional[str] = None
    
    leaf_shape: Optional[str] = None
    leaf_variegation: Optional[str] = None
    leaf_color_type: Optional[str] = None
    leaf_features: Optional[str] = None 
    
    origin: Optional[str] = None
    breeder: Optional[str] = None
    breeder_origin_country: Optional[str] = None  
    selection_year: Optional[int] = None
    data_source: Optional[str] = None  
    photo_source: Optional[str] = None

    @validator("selection_year", pre=True)
    def validate_selection_year(cls, value):
        if value in (None, ""):
            return None
        if isinstance(value, str):
            value = value.strip()
            if value.isdigit():
                value = int(value)
            else:
                raise ValueError("Рік селекції повинен бути числом.")
        if isinstance(value, float):
            value = int(value)
        if isinstance(value, int):
            current_year = datetime.now().year
            if value < 1892 or value > current_year:
                raise ValueError(f"Рік селекції має бути між 1892 і {current_year}.")
        return value


class SaintpauliaSearchCriteria(BaseModel):
    size_category: Optional[str] = None
    growth_type: Optional[str] = None

    main_flower_color: Optional[str] = None
    flower_color_type: Optional[str] = None
    flower_edge_color: Optional[str] = None
    ruffles: Optional[str] = None
    ruffles_color: Optional[str] = None
    flower_size: Optional[str] = None
    flower_shape: Optional[str] = None
    flower_doubleness: Optional[str] = None
    blooming_features: Optional[str] = None
    
    leaf_shape: Optional[str] = None
    leaf_variegation: Optional[str] = None
    leaf_color_type: Optional[str] = None
    leaf_features: Optional[str] = None

    origin: Optional[str] = None

    breeder: Optional[str] = None
    breeder_origin_country: Optional[str] = None
    selection_year: Optional[int] = None
    
    class Config:
        from_attributes = True


# Модель для пагінації відповідей
class PaginatedVarietyResponse(BaseModel):
    items: List[SaintpauliaResponse]
    total: int


class SaintpauliaLogResponse(BaseModel):
    id: int
    action: str  # e.g., 'create', 'update', 'delete'
    variety_id: int
    variety_name: str  # для зручності
    user: Optional[UserShortInfo]
    timestamp: datetime

    class Config:
        from_attributes = True