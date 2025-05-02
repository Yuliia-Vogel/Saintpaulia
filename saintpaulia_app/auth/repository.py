from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from saintpaulia_app.auth.models import User
from auth.service import Hash

hash_handler = Hash()

def get_user_by_email(email: str, db: Session) -> User:
    user = db.query(User).filter(User.email == email).first()
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
    db.commit()


