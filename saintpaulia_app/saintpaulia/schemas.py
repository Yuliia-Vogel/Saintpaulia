from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from photos.schemas import PhotoResponce


class SaintpauliaBase(BaseModel):
    name: str
    description: Optional[str] = "дані ще не внесено"

    size_category: str
    flower_color: str
    flower_size: str
    flower_shape: Optional[str] = "дані ще не внесено"
    flower_doubleness: str

    leaf_shape: Optional[str] = "дані ще не внесено"
    leaf_variegation: Optional[str] = "дані ще не внесено"

    photos: Optional[list] = []
    origin: Optional[str] = "дані ще не внесено"
    selectionist: str = "дані ще не внесено"
    blooming_features: Optional[str] = "дані ще не внесено"
    selection_year: Optional[int] = None

    @validator("selection_year", pre=True)
    def validate_selection_year(cls, value):
        if value == "":
            return None
        if isinstance(value, str) and value.isdigit():
            value = int(value)
        if isinstance(value, int) and (value < 1800 or value > datetime.now().year):
            raise ValueError("Рік селекції має бути між 1800 і поточним роком.")
        return value


class SaintpauliaCreate(SaintpauliaBase):
    pass


class SaintpauliaResponse(SaintpauliaBase):
    id: int
    owner_id: int  # автозаповнення з авторизації
    record_creation_date: datetime
    photos: list[PhotoResponce] = []

    class Config:
        from_attributes = True