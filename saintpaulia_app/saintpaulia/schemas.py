from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


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

    photo_url: Optional[str] = ""
    origin: Optional[str] = "дані ще не внесено"
    selectionist: str = "дані ще не внесено"
    selection_year: Optional[int] = None
    blooming_features: Optional[str] = "дані ще не внесено"


class SaintpauliaCreate(SaintpauliaBase):
    pass


class SaintpauliaResponse(SaintpauliaBase):
    id: int
    owner_id: int  # автозаповнення з авторизації
    record_creation_date: datetime

    class Config:
        from_attributes = True