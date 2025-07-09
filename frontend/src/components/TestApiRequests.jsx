import { useEffect } from "react";
import { fetchVarietiesNames, checkNameUnique } from "../services/fieldOptionsService";

export function TestApiRequests() {
  useEffect(() => {
    const test = async () => {
      try {
        const names = await fetchVarietiesNames();
        console.log("Назви з бази:", names);

        const isUnique = await checkNameUnique("Тестовий сорт");
        console.log("Чи унікальна назва 'Тестовий сорт':", isUnique);
      } catch (error) {
        console.error("Помилка під час тесту API:", error);
      }
    };

    test();
  }, []);

  return <div>✅ Перевірка API (дивись консоль)</div>;
}
