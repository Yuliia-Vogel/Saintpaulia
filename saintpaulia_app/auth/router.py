from fastapi import APIRouter, Depends, HTTPException, status, Security, Request, BackgroundTasks
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from starlette.status import HTTP_200_OK

from database import get_db
from auth.config import SECRET_KEY, ALGORITHM
from auth.token import create_access_token, create_refresh_token, get_email_form_refresh_token, create_reset_password_token, verify_reset_password_token
from auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from auth.schemas import UserCreate, RequestEmail, RequestPasswordReset, ResetPassword
from auth.repository import get_user_by_email, create_user, update_user_refresh_token, confirm_user_email
from auth.service import Hash
from auth.security import verify_password
from services.email import send_confirmation_email, send_password_reset_email

router = APIRouter()
hash_handler = Hash()
security = HTTPBearer()


@router.post("/signup")
async def signup(body: UserCreate, 
                 request: Request, 
                  background_tasks: BackgroundTasks,
                  db: Session = Depends(get_db)):
    new_user = create_user(body.email, body.password, db)
    host = str(request.base_url)[:-1]  # прибираємо /
    background_tasks.add_task(send_confirmation_email, new_user.email, new_user.email) # new_user.email, new_user.email: перший - це кому, другий - як звертатись
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


@router.get("/confirm-email")
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
    


@router.post("/request-email")
async def request_email_verification(
    body: RequestEmail,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
    ):
    user = db.query(User).filter(User.email == body.email).first()
    if user and user.confirmed:
        return {"message": "Your email is already confirmed"}
    if user:
        background_tasks.add_task(send_confirmation_email, user.email, user.username)
        # background_tasks.add_task(send_confirmation_email, user.email, user.username, str(request.base_url))
    # завжди повертаємо одне й те саме
    return {"message": "Check your email for confirmation"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.refresh_token = None
    db.commit()
    return {"message": "Ви успішно вийшли з акаунту."}


# лише для локальної розробки:

# from auth.repository import create_superuser

# @router.post("/create-superuser") 
# def create_superuser_endpoint(db: Session = Depends(get_db)):
#     return create_superuser("juliya.naukma@gmail.com", "juliya_pass", db)


@router.post("/forgot-password")
async def forgot_password(
    body: RequestPasswordReset,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(body.email, db)
    if user:
        token = create_reset_password_token({"sub": user.email})
        reset_link = f"{request.base_url}reset-password?token={token}"
        background_tasks.add_task(send_password_reset_email, user.email, user.email, reset_link) # user.email, user.email: перший - куди, другий - як звертатись
    return {"message": "If the user exists, a password reset email has been sent."}


@router.post("/reset-password")
async def reset_password(
    body: ResetPassword,
    db: Session = Depends(get_db),
):
    email = verify_reset_password_token(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = get_user_by_email(email, db)
    user.hashed_password = hash_handler.get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password reset successful"}