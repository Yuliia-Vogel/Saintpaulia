from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from photos.schemas import PhotoResponce


# Базова модель верифікації сорту
class VerificationBase(BaseModel):
    is_verified: bool
    verified_by: int
    verification_date: datetime
    verification_note: Optional[str] = None

# Модель відповіді
class VerificationResponse(VerificationBase):
    pass

# Модель для оновлення статусу
class VerificationUpdate(BaseModel):
    is_verified: bool
    verification_note: Optional[str] = None


class SaintpauliaBase(BaseModel):
    name: str
    description: Optional[str] = None

    size_category: str
    flower_color: Optional[str] = None
    flower_size: Optional[str] = None
    flower_shape: Optional[str] = None
    flower_doubleness: Optional[str] = None
    ruffles: Optional[bool] = None
    ruffles_color: Optional[str] = None
    blooming_features: Optional[str] = None
    
    leaf_shape: Optional[str] = None
    leaf_variegation: Optional[str] = None

    # photos: Optional[list[PhotoResponce]] = [] # це поле не використ.при створенні сорту
    origin: Optional[str] = None
    selectionist: Optional[str] = None
    selection_year: Optional[int] = None

    @validator("selection_year", pre=True)
    def validate_selection_year(cls, value):
        if value == "":
            return None
        if isinstance(value, str):
            value = value.strip()
            if value.isdigit():
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
    is_verified: bool  # для перевірки сортів адмінами
    photos: list[PhotoResponce] = []

    verification: Optional[VerificationResponse] = None

    class Config:
        from_attributes = True


# Модель для пагінації відповідей
class PaginatedVarietyResponse(BaseModel):
    items: List[SaintpauliaResponse]
    total: int