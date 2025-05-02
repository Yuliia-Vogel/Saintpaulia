from fastapi import APIRouter, Depends, HTTPException, status, Security
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer

from database import get_db
from auth.token import create_access_token, create_refresh_token, get_email_form_refresh_token
from auth.dependencies import get_current_user
from auth.models import User
from auth.schemas import UserCreate
from auth.repository import get_user_by_email, create_user, update_user_refresh_token, confirm_user_email
from auth.service import Hash
from auth.security import verify_password

router = APIRouter()
hash_handler = Hash()
security = HTTPBearer()

@router.post("/signup")
async def signup(body: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(body.email, body.password, db)
    return {"new_user": new_user.email}

@router.post("/login")
async def login(body: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(body.username, db)
    if not hash_handler.verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    
    access_token = await create_access_token(data={"sub": user.email})
    refresh_token = await create_refresh_token(data={"sub": user.email})
    update_user_refresh_token(user, refresh_token, db)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.get('/refresh_token')
async def refresh_token(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    email = await get_email_form_refresh_token(token)
    user = get_user_by_email(email, db)

    if user.refresh_token != token:
        user.refresh_token = None
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access_token = await create_access_token(data={"sub": email})
    refresh_token = await create_refresh_token(data={"sub": email})
    update_user_refresh_token(user, refresh_token, db)

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.get("/open_page")
async def root():
    return {"message": "Hello World! It's open information!"}

@router.get("/secret")
async def read_item(current_user: User = Depends(get_current_user)):
    return {"message": 'secret router', "owner": current_user.email}


@router.post("/confirm_email")
async def confirm_email(email: str, db: Session = Depends(get_db)):
    confirm_user_email(email, db)
    return {"message": f"Email {email} підтверджено!"}