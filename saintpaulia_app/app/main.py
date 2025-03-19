from fastapi import FastAPI
from sqlalchemy.exc import SQLAlchemyError
from fastapi.security import OAuth2PasswordBearer

import database
from auth.router import router as auth_router
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


app.include_router(auth_router, prefix="/auth", tags=["Auth"])

# # ✅ Правильний спосіб змінити OpenAPI-схему
# def custom_openapi():
#     if app.openapi_schema:
#         return app.openapi_schema  # Використовуємо кешовану версію

#     openapi_schema = app.openapi()  # Отримуємо оригінальну OpenAPI-схему
#     openapi_schema["components"]["securitySchemes"] = {
#         "BearerAuth": {
#             "type": "http",
#             "scheme": "bearer",
#             "bearerFormat": "JWT",
#         }
#     }
#     openapi_schema["security"] = [{"BearerAuth": []}]
#     app.openapi_schema = openapi_schema  # Зберігаємо оновлену схему
#     return app.openapi_schema


# app.openapi = custom_openapi  # Перевизначаємо метод OpenAPI

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
