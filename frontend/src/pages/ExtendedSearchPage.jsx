// src/pages/ExtendedSearchPage.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { staticOptions } from "../constants/fieldOptions";
import { Link } from "react-router-dom";

const fieldLabels = {
  name: "Назва сорту",
  description: "Опис",
  size_category: "Розмір розетки",
  flower_color: "Колір квітів",
  flower_size: "Розмір квітів",
  flower_shape: "Форма квітів",
  flower_doubleness: "Наповненість квітів",
  blooming_features: "Характеристики цвітіння",
  ruffles: "Рюші",
  ruffles_color: "Колір рюш",
  leaf_shape: "Форма листків",
  leaf_variegation: "Строкатість листя",
  selectionist: "Селекціонер",
  selection_year: "Рік селекції",
  origin: "Походження сорту",
  owner_id: "Автор запису",
  record_creation_date: "Дата створення запису",
};

export default function ExtendedSearchPage() {
  const [fieldOptions, setFieldOptions] = useState({});
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paramsSummary, setParamsSummary] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get("/saintpaulia/field-options");
        setFieldOptions(response.data);
      } catch (err) {
        console.error("Помилка завантаження параметрів:", err);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "-" ? "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filledFields = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v)
    );

    if (Object.keys(filledFields).length === 0) {
      setError("Заповніть хоча б одне поле для пошуку.");
      return;
    }

    setError("");
    setLoading(true);

    const params = new URLSearchParams(filledFields).toString();
    try {
      const response = await api.get(`/saintpaulia/extended_search?${params}`);
      setResults(response.data.items || response.data);
      setParamsSummary(
        Object.entries(filledFields)
          .map(([key, value]) => `${fieldLabels[key] || key}: ${value}`)
          .join(", ")
      );
    } catch (err) {
      console.error("Помилка пошуку:", err);
      setError("Сталася помилка при пошуку.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl mb-4 font-semibold">Розширений пошук сортів</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(staticOptions).map(([field, options]) => (
          <div key={field}>
            <label className="block font-medium mb-1">
              {fieldLabels[field] || field.replace(/_/g, " ")}
            </label>
            <select
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        {fieldOptions && Object.entries(fieldOptions).map(([field, options]) => (
          <div key={field}>
            <label className="block font-medium mb-1">
              {fieldLabels[field] || field.replace(/_/g, " ")}
            </label>
            <select
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">-</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Пошук..." : "Виконати пошук"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {paramsSummary && (
        <div className="mt-6">
          <p className="mb-2">
            <strong>Ваші параметри:</strong> {paramsSummary}
          </p>
          <p className="mb-2">
            <strong>За вашим запитом знайдено:</strong> {results.length} сортів:
          </p>
          <ul className="list-disc ml-6">
            {results.map((variety) => (
              <li key={variety.id}>
                <Link to={`/variety/${encodeURIComponent(variety.name)}`} className="text-blue-700 hover:underline">
                  {variety.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <Link to="/search" className="text-blue-600 hover:underline">
          ← Назад до простого пошуку
        </Link>
      </div>
    </div>
  );
}
