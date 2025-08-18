import sys
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from saintpaulia_app.database import SessionLocal, engine
from saintpaulia_app.saintpaulia.models import Saintpaulia


def import_varieties(file_path: str):
    # Читаємо Excel, пропускаючи перший рядок (англомовні заголовки)
    df = pd.read_excel(file_path)
    df = df.drop(index=0)  # прибираємо рядок з англомовними назвами
    df = df.drop(columns=[col for col in df.columns if "Unnamed" in col], errors="ignore")
    df = df.fillna("")  # замінюємо NaN на порожній рядок

    db: Session = SessionLocal()

    added_count = 0
    skipped_count = 0
    skipped_varieties = []

    for _, row in df.iterrows():
        name = row["Назва сорту "].strip()
        if not name:
            continue

        # Перевірка наявності сорту
        exists = db.query(Saintpaulia).filter(Saintpaulia.name == name).first()
        if exists:
            skipped_count += 1
            skipped_varieties.append(name)
            continue

        try:
            variety = Saintpaulia(
                name=name,
                description=row["Опис сорту"],
                size_category=row["Розмір розетки"],
                growth_type=row["Тип росту"],
                main_flower_color=row["Основний колір квітів"],
                flower_color_type=row["Тип забарвлення квітів"],
                flower_edge_color=row["Облямівка квітки"],
                ruffles=row["Рюші"],
                ruffles_color=row["Колір рюш"],
                flower_colors_all=row["Всі кольори квітів"],
                flower_size=row["Розмір квітів"],
                flower_shape=row["Форма квітів"],
                petals_shape=row["Форма пелюсток"],
                flower_doubleness=row["Наповненість квітів"],
                blooming_features=row["Характеристики цвітіння"],
                leaf_shape=row["Форма листків"],
                leaf_variegation=row["Строкатість листя"],
                leaf_color_type=row["Тип забарвлення листка (химера)"],
                leaf_features=row["Додаткові характеристики листка"],
                origin=row["Походження (батьківські сорти)"],
                breeder=row["Селекціонер"],
                selection_year=int(row["Рік селекції"]) if str(row["Рік селекції"]).isdigit() else None,
                breeder_origin_country=row["Країна селекціонер"],
                data_source=row["Джерело"],
                owner_id=1
            )
            db.add(variety)
            added_count += 1
        except Exception as e:
            skipped_count += 1
            skipped_varieties.append(f"{name} (помилка: {e})")

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        print(f"❌ Помилка при збереженні в базу: {e}")
    finally:
        db.close()

    # Логування результатів
    print("===== РЕЗУЛЬТАТ ІМПОРТУ =====")
    print(f"Всього рядків у файлі: {len(df)}")
    print(f"✅ Додано: {added_count}")
    print(f"⏩ Пропущено: {skipped_count}")
    if skipped_varieties:
        print("Пропущені сорти:")
        for v in skipped_varieties:
            print(f" - {v}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Використання: python import_varieties.py <шлях_до_excel>")
        sys.exit(1)
    import_varieties(sys.argv[1])
