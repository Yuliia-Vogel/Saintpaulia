import logging  

from fastapi import FastAPI, Request
from sqlalchemy.exc import SQLAlchemyError
from fastapi.security import OAuth2PasswordBearer
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder

import database
from auth.router import router as auth_router
from photos.router import router as photos_router
from saintpaulia.router import router as saintpaulia_router
from admin_panel.router import router as admin_router
from auth.dependencies import oauth2_scheme as security_scheme


app = FastAPI(
    title="Saintpaulia API",
    description="API for managing Saintpaulia varieties",
    version="1.0",
    swagger_ui_parameters={"persistAuthorization": True},  # Запам'ятовує авторизацію
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],  # дозволяємо запити з фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Налаштування логування
logging.basicConfig(
    level=logging.INFO,  # Можна DEBUG, якщо хочеш бачити більше деталей
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Оголошення OAuth2 схеми безпеки
oauth2_scheme = security_scheme


@app.get("/")
async def root():
    return {"message" : "Welcome to the Saintpaulia app!"}


app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(saintpaulia_router, prefix="/saintpaulia", tags=["Saintpaulia"])
app.include_router(photos_router, prefix="/photos", tags=["Photos"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

# Функція для перевірки підключення
def check_database_connection():
    try:
        connection = database.engine.connect()        
        connection.close()        
        print("Database connection successful!")
    except SQLAlchemyError as e:
        print(f"Database connection failed: {e}")
        
        
@app.on_event("startup")
async def startup_event():    
    check_database_connection()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )