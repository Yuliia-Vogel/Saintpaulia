# головна і **єдина** задача файлу repository.py — "говорити" з базою даних

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from saintpaulia_app.auth.models import User
# from saintpaulia_app.photos import service as photo_service
from saintpaulia_app.auth.service import Hash


hash_handler = Hash()

def log_action(action: str, user: User, db: Session):
    if user is None:
        raise ValueError("log_action called with user=None")
    
    log_entry = User(
        action=action,
        user_id=user.id,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(log_entry)
    db.commit()


def get_user_by_email(email: str, db: Session) -> User:
    user = db.query(User).filter(User.email == email).first()
    print(f"User: {user}")
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def create_user(email: str, password: str, db: Session) -> User:
    exist_user = db.query(User).filter(User.email == email).first()
    if exist_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already exists")
    new_user = User(email=email, hashed_password=hash_handler.get_password_hash(password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def update_user_refresh_token(user: User, new_token: str, db: Session) -> None:
    user.refresh_token = new_token
    db.commit() 

def confirm_user_email(email: str, db: Session) -> None:
    user = get_user_by_email(email, db)
    user.confirmed = True
    user.email_confirmed_at = datetime.now(timezone.utc)
    db.commit()


# лише для локальної розробки

from saintpaulia_app.auth.models import UserRole
from saintpaulia_app.auth.security import hash_password

def create_superuser(email: str, password: str, db: Session):
    hashed_pw = hash_password(password)
    superuser = User(
        email=email,
        hashed_password=hashed_pw,
        is_active=True,
        is_superuser=True,
        confirmed=True,
        role=UserRole.superadmin
    )
    db.add(superuser)
    db.commit()
    db.refresh(superuser)
    return superuser