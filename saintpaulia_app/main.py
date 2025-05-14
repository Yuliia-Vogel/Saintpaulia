from fastapi import FastAPI, Request
from sqlalchemy.exc import SQLAlchemyError
from fastapi.security import OAuth2PasswordBearer
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from fastapi.middleware.cors import CORSMiddleware

import database
from auth.router import router as auth_router
from photos.router import router as photos_router
from saintpaulia.router import router as saintpaulia_router
from auth.dependencies import oauth2_scheme as security_scheme


app = FastAPI(
    title="Saintpaulia API",
    description="API for managing Saintpaulia varieties",
    version="1.0",
    swagger_ui_parameters={"persistAuthorization": True},  # Запам'ятовує авторизацію
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # дозволяємо запити з фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Оголошення OAuth2 схеми безпеки
oauth2_scheme = security_scheme


@app.get("/")
async def root():
    return {"message" : "Welcome to the Saintpaulia app!"}


app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(saintpaulia_router, prefix="/saintpaulia")
app.include_router(photos_router)

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
        content={"detail": "Invalid input. Please provide a valid email address."}
    )