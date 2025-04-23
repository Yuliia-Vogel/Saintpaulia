from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func
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
    photo_url = Column(String, default="")  # потім інтегруємо із Cloudinary
    origin = Column(String, default="дані ще не внесено") # походження сорту
    selectionist = Column(String, nullable=False, default="дані ще не внесено")
    selection_year = Column(Integer, nullable=True)
    blooming_features = Column(Text, default="дані ще не внесено")

    #дані про того, хто вніс запис
    record_author = Column(String)
    record_creation_date = Column(DateTime, default=func.now())
