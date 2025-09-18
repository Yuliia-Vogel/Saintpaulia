from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Text, ForeignKey
from saintpaulia_app.database import Base
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import relationship
import enum


class UserRole(enum.Enum):
    user = "user" # звичайний користувач
    expert = "expert" # експерт, який вже може додавати сорти
    breeder = "breeder" # селекціонер, який може додавати сорти, а також верифікувати свої сорти
    admin = "admin"
    superadmin = "superadmin" # бог сайту


class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    user_creation_date = Column(DateTime, nullable=True, default=func.now()) # Дата створення, встановлюється автоматично
    email_confirmed_at = Column(DateTime, nullable=True) # Дата підтвердження email 
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone_number = Column(String(20), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    bio = Column(Text, nullable=True) # Використовуємо Text для довгих описів
    refresh_token = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(SqlEnum(UserRole, name="userrole"), default=UserRole.user, nullable=False)  # user, expert, breeder, admin, superuser
    confirmed = Column(Boolean, default=False) 
     # зв’язки
    saintpaulias = relationship(
        "Saintpaulia",
        back_populates="owner",
        foreign_keys="Saintpaulia.owner_id",
        cascade="all, delete-orphan"
    )

    verified_varieties = relationship(
        "Saintpaulia",
        back_populates="verifier",
        foreign_keys="Saintpaulia.verified_by"
    )

    role_history = relationship(
        "UserRoleHistory",
        back_populates="user",
        foreign_keys="UserRoleHistory.user_id",
        cascade="all, delete-orphan"
    )


    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
    

class UserRoleHistory(Base):
    __tablename__ = "user_role_history"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    old_role = Column(SqlEnum(UserRole, name="userrole_history_old"), nullable=True)
    new_role = Column(SqlEnum(UserRole, name="userrole_history_new"), nullable=False)
    changed_at = Column(DateTime, nullable=False, server_default=func.now())
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="role_history", foreign_keys=[user_id])
    changer = relationship("User", foreign_keys=[changed_by_id])

    def __repr__(self):
        return f"<UserRoleHistory(user_id={self.user_id}, old={self.old_role}, new={self.new_role})>"
