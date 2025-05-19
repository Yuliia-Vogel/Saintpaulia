
import os
from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi_mail.errors import ConnectionErrors
from pydantic import EmailStr
from dotenv import load_dotenv

from auth.token import create_email_token, create_reset_password_token  # ф-ція створення токена

load_dotenv() # завантажуються дані з файлу .env 


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=os.getenv("MAIL_PORT"),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=Path(__file__).parent / 'templates',
)


# async def send_confirmation_email(email: EmailStr, username: str, host: str):
#     try:
#         token_verification = create_email_token({"sub": email})
#         message = MessageSchema(
#             subject="Confirm your email",
#             recipients=[email],
#             template_body={"host": host, "username": username, "token": token_verification},
#             subtype=MessageType.html
#         )

#         fm = FastMail(conf)
#         await fm.send_message(message, template_name="confirmation_email.html")
#     except ConnectionErrors as err:
#         print(err)


async def send_confirmation_email(email: EmailStr, username: str):
    try:
        token_verification = create_email_token({"sub": email})

        # Збираємо посилання на фронтенд
        confirm_link_host = os.getenv("FRONTEND_URL")  # або просто використовуй FRONTEND_URL, якщо воно вже глобальне

        message = MessageSchema(
            subject="Confirm your email",
            recipients=[email],
            template_body={
                "host": confirm_link_host,
                "username": username,
                "token": token_verification
            },
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message, template_name="confirmation_email.html")
    except ConnectionErrors as err:
        print(err)


# async def send_password_reset_email(email: EmailStr, username: str, host: str, reset_link: str):
async def send_password_reset_email(email: EmailStr, username: str, reset_link: str):
    try:
        token = create_reset_password_token({"sub": email})
        message = MessageSchema(
            subject="Ви запросили відновлення пароля на сайті Saintpaulia",
            recipients=[email],
            # template_body={"host": host, "username": username, "token": token},
            template_body={"username": username, "reset_link": reset_link},
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message, template_name="password_reset_email.html")
    except ConnectionErrors as err:
        print(err)