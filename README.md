# Saintpaulias
A web-based application for saintpaulia varieties management.

1) postgress creation in CMD:
   docker run --name fialka_db -p 5433:5432 -e POSTGRES_PASSWORD=fialka_db_pass -d postgres
2) Redis container creation in CMD (for FastapiLimiter, але сам лімітер поки не реалізувала):
   docker run -d -p 6379:6379 redis
3) python -m venv venv
4) venv\Scripts\Activate
5) якщо в VSCode - pip install poetry 
   якщо ж PyCharm - то пропускаємо цей крок
6) poetry install
7) alembic revision --autogenerate -m "Init"
8) alembic upgrade head
9) to create superuser for local development: 
a - open file "auth/repository.py" and make  active "def create_superuser"
b - open file "auth/router.py" and make  active "@router.post("/create-superuser")"
c - run the application: uvicorn main:app --reload
d - go to Swagger documentation - uri: http://127.0.0.1:8000/docs, endpoint "/create-superuser" ->
   -> Try it out -> Execute
e - Great! Your superuser created! Make inactive the code tou activated in steps "a" and "b"
10) Run uvicorn server in terminal: 
uvicorn main:app --reload
11) install node.js to your computer
Перейди на https://nodejs.org
Завантаж LTS версію (Long Term Support) — зелена кнопка.
Запусти .msi інсталятор і не став додаткові компоненти Visual Studio (просто тицяй "Next" і "Install").
Після завершення відкрий нову PowerShell/термінал і виконай:
node -v
npm -v
12) Встановлюємо Tailwind:
npm install -D tailwindcss@3.4.1
13) Встановлюю jwt-decode для парсингу jwt-токена:
npm install jwt-decode
14) Потім запускаємо наш фронтенд: npm run dev
І переходимо на сторінку http://localhost:5173/ , де відображається наш фронт.
Для коректної роботи сторінки з фронтендом слід паралельно в окремому терміналі запустити бекенд (уже запустили в п. 10) 



!!! Щоб масово завантажити сорти з екселя в базу даних, потрібно в корені проекту з активним віртуальним оточенням 
запустити команду:
python import_varieties.py "Копія _БАЗА сортів_ (1).xlsx"
Де "Копія _БАЗА сортів_ (1).xlsx" - це назва ексель-файлу з базою стандартної структури для цього проекту. 
Ексель файл має лежати в корені проекту, на рівні файлу import_varieties.py.
Всі сорти будуть завантажені від імені користувача з id=1, тобто такий користувач уже має бути в базі.

!!! Щоб масово завантажити фото для сортів з папки на комп"ютері, слід в активному віртуальному оточенні запустити 
скрикп:
python import_photos.py "D:\Yuliia\saintpaulia photos I-net"
де "D:\Yuliia\saintpaulia photos I-net" - це адреса, де локально лежить папка з фотографіями сорту.
Скрипт завантажує по 1 фото для кожного сорту в базі, якщо в сорту вже є фото - він пропускає фото.
Назва фото мусить бути знак в знак точно такою самою, як і сорту в базі, тоді скрипт успішно знайде фото для сорту.