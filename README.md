# Saintpaulias
A web-based application for saintpaulia varieties management.

1) postgress creation:
   docker run --name fialka_db -p 5433:5432 -e POSTGRES_PASSWORD=fialka_db_pass -d postgres
2) python -m venv venv
3) venv\Scripts\Activate
4) якщо в VSCode - pip install poetry 
   якщо ж PyCharm - то пропускаємо цей крок
5) poetry install
6) alembic revision --autogenerate -m "Init"
7) alembic upgrade head
8) to create superuser for local development: 
a - open file "auth/repository.py" and make  active "def create_superuser"
b - open file "auth/router.py" and make  active "@router.post("/create-superuser")"
c - run the application: uvicorn main:app --reload
d - go to Swagger documentation - uri: http://127.0.0.1:8000/docs, endpoint "/create-superuser" ->
   -> Try it out -> Execute
e - Great! Your superuser created! Make inactive the code tou activated in steps "a" and "b"
