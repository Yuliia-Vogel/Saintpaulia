from fastapi import FastAPI
from sqlalchemy.exc import SQLAlchemyError
from fastapi.security import OAuth2PasswordBearer

import database
from auth.router import router as auth_router
from saintpaulia.router import router as saintpaulia_router
from auth.dependencies import oauth2_scheme as security_scheme


app = FastAPI(
    title="Saintpaulia API",
    description="API for managing Saintpaulia varieties",
    version="1.0",
    swagger_ui_parameters={"persistAuthorization": True},  # Запам'ятовує авторизацію
)


# Оголошення OAuth2 схеми безпеки
oauth2_scheme = security_scheme

@app.get("/api/healthchecker")
def root():
    return {"message" : "Welcome to the Saintpaulia app!"}


@app.get("/")
async def root():
    return {"message" : "Hello! The app is working!"}


app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(saintpaulia_router, prefix="/saintpaulia")

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
