import { useEffect, useState, useRef } from "react";
import { fetchVarietiesNames, checkNameUnique } from "../services/fieldOptionsService";

export default function VarietyNameField({ value, onChange }) {
  const [allNames, setAllNames] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);
  const [isUnique, setIsUnique] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const loadNames = async () => {
      try {
        const names = await fetchVarietiesNames();
        setAllNames(names);
      } catch (error) {
        console.error("Не вдалося завантажити назви сортів:", error);
      }
    };
    loadNames();
  }, []);

  useEffect(() => {
    if (value.trim()) {
      const filtered = allNames.filter((name) =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNames(filtered);
    } else {
      setFilteredNames([]);
    }
  }, [value, allNames]);

  useEffect(() => {
    const check = async () => {
      if (value.trim()) {
        try {
          const unique = await checkNameUnique(value);
          setIsUnique(unique);
        } catch (error) {
          console.error("Помилка при перевірці унікальності назви:", error);
        }
      } else {
        setIsUnique(null);
      }
    };
    check();
  }, [value]);

  const handleSuggestionClick = (suggestion) => {
    onChange({ target: { name: "name", value: suggestion } });
    setShowSuggestions(false);
    inputRef.current.blur();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name="name"
        value={value}
        onChange={(e) => {
          onChange(e);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 100); // невеличка затримка для кліку
        }}
        placeholder="Введіть назву сорту"
        className="w-full border px-3 py-2 rounded-xl text-sm"
      />
      {showSuggestions && filteredNames.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-xl shadow mt-1 max-h-40 overflow-auto text-sm">
          {filteredNames.map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 hover:bg-violet-100 cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {isUnique !== null && (
        <p
          className={`mt-1 text-sm ${
            isUnique ? "text-green-600" : "text-red-600"
          }`}
        >
          {isUnique ? "Назва унікальна" : "Назва вже використовується"}
        </p>
      )}
    </div>
  );
}
