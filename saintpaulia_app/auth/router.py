from fastapi import APIRouter, Depends, HTTPException, status, Security, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from database import get_db
from auth.token import SECRET_KEY, ALGORITHM
from auth.token import create_access_token, create_refresh_token, get_email_form_refresh_token
from auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from auth.schemas import UserCreate
from auth.repository import get_user_by_email, create_user, update_user_refresh_token, confirm_user_email
from auth.service import Hash
from auth.security import verify_password
from services.email import send_email

router = APIRouter()
hash_handler = Hash()
security = HTTPBearer()


@router.post("/signup")
async def signup(body: UserCreate, request: Request, db: Session = Depends(get_db)):
    new_user = create_user(body.email, body.password, db)
    host = str(request.base_url)[:-1]  # прибираємо /
    await send_email(new_user.email, new_user.email, host) # ЧОМУ ТУТ ПОДВОЄНО new_user.email? 
    return {"message": "Check your email to confirm your registration"}


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


@router.get("/confirm_email")
async def confirm_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        confirm_user_email(email, db)
        return {"message": f"Email {email} confirmed!"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    


# лише для локальної розробки

# from auth.repository import create_superuser

# @router.post("/create-superuser") 
# def create_superuser_endpoint(db: Session = Depends(get_db)):
#     return create_superuser("juliya.naukma@gmail.com", "juliya_pass", db)