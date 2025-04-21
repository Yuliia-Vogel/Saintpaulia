# Saintpaulias
A web-based application for saintpaulia varieties management.

1) postgress creation:
   docker run --name fialka_db -p 5433:5432 -e POSTGRES_PASSWORD=fialka_db_pass -d postgres
2) python -m venv venv
3) venv\Scripts\Activate
4) якщо в VSCode - pip install poetry 
   якщо ж PyCharm - то пропускаємо цей крок
5) poetry install
6) cd saintpaulia_app
7) alembic revision --autogenerate -m "Init"
8) alembic upgrade head