___________
DEVELOPMENT
___________

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
python import_varieties.py "Varieties_table.xlsx"
Де "Копія _БАЗА сортів_ (1).xlsx" - це назва ексель-файлу з базою стандартної структури для цього проекту. 
Ексель файл має лежати в корені проекту, на рівні файлу import_varieties.py.
Всі сорти будуть завантажені від імені користувача з id=1, тобто такий користувач уже має бути в базі.

!!! Щоб масово завантажити фото для сортів з папки на комп"ютері, слід в активному віртуальному оточенні запустити 
скрикп:
python import_photos.py "D:\Yuliia\saintpaulia photos"
де "D:\Yuliia\saintpaulia photos I-net" - це адреса, де локально лежить папка з фотографіями сорту.
Скрипт завантажує по 1 фото для кожного сорту в базі, якщо в сорту вже є фото - він пропускає фото.
Назва фото мусить бути знак в знак точно такою самою, як і сорту в базі, тоді скрипт успішно знайде фото для сорту.




__________
PRODUCTION
__________
ЯК ЛОКАЛЬНО (ЗІ СВОГО КОМПА) ПІДКЛЮЧИТИСЯ ДО БАЗИ ПОСТГРЕС НА RENDER.COM
________________________________________________________________________

1. Зайти в папку fialka (місце, де зберігається файл alembic.ini)
2. Правою кнопкою миші по фону -> Git Bush Here
3. Далі працюємо у Bash. Тут ми через термінал, використовуючи наші файли локально на комп"ютері, 
   підключимося до бази даних Postgres на сайті Render.com і, використовуючи знову ж таки файли і скрипти 
   локально на комп"ютері здійснимо міграції в базі на Render.com та завантажимо сорти і до них фотки з мого локального комп"ютера.
4. Активуємо віртуальне середовище проекту:
   venv/Scripts/activate
   Після цього перед рядком з локацією Bash має з"явитися "(venv)"
5. Тепер в активному віртуальному середовищі підключаємося до бази даних на Render.com, використовуючи External URL і модифікувавши його під нашу базу 
   (додаємо +psycopg2 на початку та ?sslmode=require в самому кінці лінка):
   export DATABASE_URL="postgresql+psycopg2://yuliia:HcRWLqFR6dnD65cFFfY8Lts7rIqJWDrm@dpg-d2qp0if5r7bs73b1ic4g-a.frankfurt-postgres.render.com/fialka_db?sslmode=require"
6. Перевіряємо стан міграцій на даний момент:
   alembic current
6a. На цьому етапі я отримала помилку:

Traceback (most recent call last):
......
  File "D:\Yuliia\fialka\alembic\env.py", line 7, in <module>
    from saintpaulia_app.database import SQLALCHEMY_DATABASE_URL as Database_url
ImportError: cannot import name 'SQLALCHEMY_DATABASE_URL' from 'saintpaulia_app.database' (D:\Yuliia\fialka\saintpaulia_app\database.py)
6b. Я пішла в файл env.py (всередині папки alembic) і зробила так, щоб SQLALCHEMY_DATABASE_URL тут діставався напряму з файлу .env, 
а не імпортувався з якихось інших модулів, які не працюють в момент наших спроб міграції на хостингу Render.com.
6c. Повторила команду для отримання поточних міграцій і тепер отримала адекватну відповідь:
   (venv)
   Serhii@DESKTOP-A1TA4LG MINGW64 /d/Yuliia/fialka (varieties)
   $ alembic current
   INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
   INFO  [alembic.runtime.migration] Will assume transactional DDL.
7. Виконую міграції:
   alembic upgrade head
   Міграції відбулися.

Тепер - завантаження даних так само з мого компа на базу на хостингу, тому продовжую тут же в терміналі Bash в вірт.середовищі.

8. Завантажую сорти фіалок із ексель-файлика з доп.скрипта:
   python import_varieties.py "Varieties_table_1Sep.xlsx"
8a. Але наразі отримую помилку:
Traceback (most recent call last):
  File "D:\Yuliia\fialka\import_varieties.py", line 104, in <module>
    import_varieties(sys.argv[1])
  File "D:\Yuliia\fialka\import_varieties.py", line 24, in import_varieties
    print("\u274c ▒▒▒▒▒▒▒: ▒▒▒▒▒▒▒▒▒▒ ▒ ID=1 ▒▒ ▒▒▒▒▒▒▒▒▒ ▒ ▒▒▒ ▒▒▒▒▒. ▒▒▒▒▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒.")
  File "C:\Users\Serhii\AppData\Local\Programs\Python\Python311\Lib\encodings\cp1251.py", line 19, in encode
    return codecs.charmap_encode(input,self.errors,encoding_table)[0]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
UnicodeEncodeError: 'charmap' codec can't encode character '\u274c' in position 0: character maps to <undefined>
(venv)

8b. Це якась шляпа з шифруваннями, зараз її пофіксимо примусовим застосуванням сучасного шифрування:
   export PYTHONUTF8=1
8c. І тепер знов запускаємо скрипт завантаження сортів, і тепер все пройшло Ок:
   python import_varieties.py "Varieties_table_1Sep.xlsx"

9. Завантажую фотки з папки на компі:
   python import_photos.py "D:\Yuliia\saintpaulia photos"

Все готово, йдемо на сайт saintpaulia.vercel.app і перевіряємо, що там сорти завантажені і гарненько ивідображаються. 

