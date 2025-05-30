from sqlalchemy import Column, Integer, String, Boolean
from saintpaulia_app.database import Base
from sqlalchemy import Enum as SqlEnum
import enum


class UserRole(enum.Enum):
    user = "user"
    expert = "expert"
    breeder = "breeder"
    admin = "admin"
    superadmin = "superadmin"


class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    refresh_token = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(SqlEnum(UserRole, name="userrole"), default=UserRole.user, nullable=False)  # user, expert, breeder, admin (superuser)
    confirmed = Column(Boolean, default=False) 

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"