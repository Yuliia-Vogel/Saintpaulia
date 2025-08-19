import { useEffect, useState, useCallback } from "react";
import { fetchFieldOptions } from "../services/fieldOptionsService";
import VarietyNameField from "./VarietyNameField";

export function VarietyForm({ initialData = {}, onSubmit, isSaving = false }) {
  console.log("🪄 render VarietyForm, initialData:", initialData);
 
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    size_category: initialData.size_category || '',
    growth_type: initialData.growth_type || '',

    main_flower_color: initialData.main_flower_color || '',
    flower_color_type: initialData.flower_color_type || '',
    flower_edge_color: initialData.flower_edge_color || '',
    ruffles: initialData.ruffles || '',
    ruffles_color: initialData.ruffles_color || '',
    flower_colors_all: initialData.flower_colors_all || '', 
    flower_size: initialData.flower_size || '',
    flower_shape: initialData.flower_shape || '',
    petals_shape: initialData.petals_shape || '',
    flower_doubleness: initialData.flower_doubleness || '',
    blooming_features: initialData.blooming_features || '',
    
    leaf_shape: initialData.leaf_shape || '',
    leaf_variegation: initialData.leaf_variegation || '',
    leaf_color_type: initialData.leaf_color_type || '',
    leaf_features: initialData.leaf_features || '',

    origin: initialData.origin || '',
    breeder: initialData.breeder || '',
    breeder_origin_country: initialData.breeder_origin_country || '',
    selection_year: initialData.selection_year || '',
    data_source: initialData.data_source || '', 
    
    owner_id: initialData.owner_id || '',
    record_creation_date: initialData.record_creation_date || '',
    verification_status: initialData.verification_status || false,
    verified_by: initialData.verified_by || '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [fieldOptions, setFieldOptions] = useState({});
  const [customFields, setCustomFields] = useState({});

  useEffect(() => {
    const loadFieldOptions = async () => {
      try {
        const options = await fetchFieldOptions();
        console.log("✅ Опції, які отримали з сервісу:", options);
        setFieldOptions(options);
      } catch (error) {
        console.error("Не вдалося завантажити опції для полів:", error);
      }
    };

    loadFieldOptions();
  }, []);

  const handleNameChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (value === "__custom__") {
      setCustomFields((prev) => ({ ...prev, [name]: "" }));
      setFormData((prev) => ({ ...prev, [name]: "" }));
    } else {
      setCustomFields((prev) => {
        const newCustom = { ...prev };
        delete newCustom[name];
        return newCustom;
      });
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Якщо користувач очистив поле 'ruffles', також очищуємо 'ruffles_color'
    if (name === 'ruffles' && !value) {
      setFormData(prev => ({ ...prev, ruffles_color: '' }));
    }

  }, []);

  const handleCustomChange = useCallback((e) => {
    const { name, value } = e.target;
    setCustomFields((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

   // Перед відправкою очищуємо дані
    const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== null && value !== '')
    );
    
    onSubmit(cleanedData);
  };

  const renderField = (field, label) => {
    if (field === "name") {
      return <VarietyNameField value={formData.name} onChange={handleNameChange} />;
    }

    const dynamicOpts = fieldOptions[field];
    // --- ОСНОВНА ЛОГІКА ДЛЯ ВСІХ ВИПАДАЮЧИХ СПИСКІВ ---
    // (включаючи `ruffles` та `ruffles_color`)
    if (dynamicOpts) { 
      const options = [...dynamicOpts].filter((v, i, a) => a.indexOf(v) === i && v !== "").sort();
      const isDisabled = field === 'ruffles_color' && !formData.ruffles;
      return (
        <>
          <select
            name={field}
            value={options.includes(String(formData[field])) ? formData[field] : (customFields[field] !== undefined ? "__custom__" : "")}
            onChange={handleChange}
            disabled={isDisabled}
            className={`w-full border px-3 py-2 rounded-xl text-sm ${isDisabled ? 'bg-gray-100' : ''}`}
          >
            <option value="">-</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="__custom__">Інший варіант...</option>
          </select>

          {customFields[field] !== undefined && (
            <input
              type="text"
              name={field}
              value={customFields[field]}
              onChange={handleCustomChange}
              placeholder="Введіть власне значення"
              disabled={isDisabled}
              className="mt-2 w-full border px-3 py-2 rounded-xl text-sm"
            />
          )}
        </>
      );
    }

    // 3. Логіка для поля року
    if (field === "selection_year") {
      return (
        <input
          type="number"
          name={field}
          value={formData[field]}
          onChange={handleChange}
          min="1800"
          max={new Date().getFullYear()}
          placeholder="Введіть рік селекції"
          className="w-full border px-3 py-2 rounded-xl text-sm"
        />
      );
    }

    // 4. Логіка за замовчуванням для всіх інших полів (звичайний текстовий ввід)
    const isReadOnlyField = field === "owner_id" || field === "record_creation_date";
    return (
      <input
        type="text"
        name={field}
        value={formData[field]}
        onChange={handleChange}
        disabled={isReadOnlyField}
        className={`w-full border px-3 py-2 rounded-xl text-sm ${
          isReadOnlyField ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
        }`}
      />
    );
  };
  const fields = [
    ["name", "Назва сорту"],
    ["description", "Опис"],
    ["size_category", "Розмір розетки"],
    ["growth_type" , "Тип росту"],

    ["main_flower_color", "Основний колір квітки"],
    ["flower_color_type", "Тип окрасу квітки"],
    ["flower_edge_color", "Облямівка квітки"],
    ["ruffles", "Рюші"],
    ["ruffles_color", "Колір рюш"],
    ["flower_colors_all", "Всі кольори квітки"],
    ["petals_shape", "Форма пелюсток"],
    ["flower_size", "Розмір квітів"],
    ["flower_shape", "Форма квітів"],
    ["flower_doubleness", "Наповненість квітів"],
    ["blooming_features", "Характеристики цвітіння"],

    ["leaf_shape", "Форма листків"],
    ["leaf_variegation", "Строкатість листя"],
    ["leaf_color_type", "Тип окрасу листка"],
    ["leaf_features", "Особливості листя"],

    ["origin", "Походження сорту"],

    ["breeder", "Селекціонер"],
    ["breeder_origin_country", "-"],
    ["selection_year", "Рік селекції"],
    
    ["data_source", "Джерело даних"],
    ["owner_id", "Автор запису"],
    ["record_creation_date", "Дата створення запису"],
  ];

  if (Object.keys(fieldOptions).length === 0) {
    return <p className="text-center p-4">⏳ Завантаження форми...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-4 border rounded-2xl shadow bg-white"
    >
      {fields.map(([field, label]) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {renderField(field, label)}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSaving}
        className="bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition"
      >
        {isSaving ? "Збереження..." : "Зберегти"}
      </button>
    </form>
  );
}
