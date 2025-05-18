import os
from dotenv import load_dotenv

load_dotenv() 

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES"))
 