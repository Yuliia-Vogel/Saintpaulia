import { useEffect, useState } from "react";
import { fetchVarietiesNames, checkNameUnique } from "../services/fieldOptionsService";

export default function VarietyNameField({ value, onChange }) {
  console.log("🚨 Компонент VarietyNameField монтується або перемонтовується");

  const [varietyNames, setVarietyNames] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");
  const [isUnique, setIsUnique] = useState(undefined);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);
  

  useEffect(() => {
    const loadVarieties = async () => {
      try {
        const res = await fetchVarietiesNames();
        setVarietyNames(res);  // Ось тут виправлено!
      } catch (error) {
        console.error("Не вдалося завантажити назви сортів:", error);
      }
    };
    loadVarieties();
  }, []);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setIsUnique(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setChecking(true);
        const res = await checkNameUnique(trimmed);
        console.log("✅ Перевірка завершена:", res);
        setIsUnique(res.is_unique);
      } catch (error) {
        console.error("❌ Помилка при перевірці унікальності:", error);
        setIsUnique(undefined);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);


  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    console.log("🪄 Прийшов проп value у VarietyNameField:", value);
    onChange({ target: { name: "name", value: val } });
  };

  console.log("🔄 Рендер VarietyNameField:", { inputValue, isUnique, checking });
  console.log("🧐 Умови рендера повідомлення:", {
    trimmedInput: inputValue.trim(),
    checking,
    isUnique,
  });

  return (
    <div>
      <input
        type="text"
        list="variety-names"
        name="name"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Введіть назву сорту"
        className="w-full border px-3 py-2 rounded-xl text-sm"
      />
      <datalist id="variety-names">
        {Array.isArray(varietyNames) &&
          varietyNames.map((name) => (
            <option key={name} value={name} />
          ))}
      </datalist>

      {inputValue.trim() && !checking && isUnique === true && (
        <p className="text-green-600 mt-1 text-sm">Назва доступна для створення</p>
      )}
      {inputValue.trim() && !checking && isUnique === false && (
        <p className="text-red-600 mt-1 text-sm">Сорт з такою назвою вже існує</p>
      )}
      {checking && <p className="text-gray-500 mt-1 text-sm">Перевірка назви...</p>}
    </div>
  );
}
