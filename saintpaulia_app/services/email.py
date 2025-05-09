from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi_mail.errors import ConnectionErrors
from pydantic import EmailStr

from auth.token import create_email_token, create_reset_password_token  # ф-ція створення токена

conf = ConnectionConfig(
    MAIL_USERNAME="yuliia_melnychenko88@meta.ua",
    MAIL_PASSWORD="Kitty_Mitty_Balabitti88",
    MAIL_FROM="yuliia_melnychenko88@meta.ua",
    MAIL_PORT=465,
    MAIL_SERVER="smtp.meta.ua",
    MAIL_FROM_NAME="Automated Saintpaulia",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=Path(__file__).parent / 'templates',
)


async def send_confirmation_email(email: EmailStr, username: str, host: str):
    try:
        token_verification = create_email_token({"sub": email})
        message = MessageSchema(
            subject="Confirm your email",
            recipients=[email],
            template_body={"host": host, "username": username, "token": token_verification},
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message, template_name="confirmation_email.html")
    except ConnectionErrors as err:
        print(err)


async def send_password_reset_email(email: EmailStr, username: str, host: str):
    try:
        token = create_reset_password_token({"sub": email})
        message = MessageSchema(
            subject="Ви запросили відновлення пароля на сайті Saintpaulia",
            recipients=[email],
            template_body={"host": host, "username": username, "token": token},
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message, template_name="password_reset_email.html")
    except ConnectionErrors as err:
        print(err)