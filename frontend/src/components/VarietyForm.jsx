import { useEffect, useState } from "react";
import { staticOptions } from "../constants/fieldOptions";
import { fetchFieldOptions } from "../services/fieldOptionsService";

export function VarietyForm({ initialData = {}, onSubmit }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    size_category: initialData.size_category || '',
    flower_color: initialData.flower_color || '',
    flower_size: initialData.flower_size || '',
    flower_shape: initialData.flower_shape || '',
    flower_doubleness: initialData.flower_doubleness || '',
    blooming_features: initialData.blooming_features || '',
    ruffles: initialData.ruffles ?? '',
    ruffles_color: initialData.ruffles_color || '',
    leaf_shape: initialData.leaf_shape || '',
    leaf_variegation: initialData.leaf_variegation || '',
    selectionist: initialData.selectionist || '',
    selection_year: initialData.selection_year || '',
    origin: initialData.origin || '',
    owner_id: initialData.owner_id || '',
    record_creation_date: initialData.record_creation_date || '',
  });

  const [fieldOptions, setFieldOptions] = useState({});
  const [customFields, setCustomFields] = useState({});

  useEffect(() => {
    const loadFieldOptions = async () => {
      try {
        const options = await fetchFieldOptions();
        setFieldOptions(options);
      } catch (error) {
        console.error("Не вдалося завантажити опції для полів:", error);
      }
    };

    loadFieldOptions();
  }, []);

  const handleChange = (e) => {
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
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomFields((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field, label) => {
    const staticOpts = staticOptions[field];
    const dynamicOpts = fieldOptions[field];

    // рюшики - булеве поле
    if (field === "ruffles") {
      return (
        <select
          name={field}
          value={formData[field] === true ? "true" : formData[field] === false ? "false" : ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              [field]: e.target.value === "true" ? true : e.target.value === "false" ? false : null,
            }))
          }
          className="w-full border px-3 py-2 rounded-xl text-sm"
        >
          <option value="">Не вказано</option>
          <option value="true">Так</option>
          <option value="false">Ні</option>
        </select>
      );
    }

    // селекти з варіантами
    if (staticOpts || dynamicOpts) {
      const options = [...(staticOpts || []), ...(dynamicOpts || [])]
        .filter((v, i, a) => a.indexOf(v) === i && v !== "") // унікальні значення
        .sort();

      return (
        <>
          <select
            name={field}
            value={options.includes(String(formData[field])) ? formData[field] : "__custom__"}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-xl text-sm"
          >
            <option value="">Не вказано</option>
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
              className="mt-2 w-full border px-3 py-2 rounded-xl text-sm"
            />
          )}
        </>
      );
    }

    // інші поля (звичайні текстові)
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
    ["flower_color", "Колір квітів"],
    ["flower_size", "Розмір квітів"],
    ["flower_shape", "Форма квітів"],
    ["flower_doubleness", "Наповненість квітів"],
    ["blooming_features", "Характеристики цвітіння"],
    ["ruffles", "Рюші"],
    ["ruffles_color", "Колір рюш"],
    ["leaf_shape", "Форма листків"],
    ["leaf_variegation", "Строкатість листя"],
    ["selectionist", "Селекціонер"],
    ["selection_year", "Рік селекції"],
    ["origin", "Походження сорту"],
    ["owner_id", "Автор запису"],
    ["record_creation_date", "Дата створення запису"],
  ];

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
        className="bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition"
      >
        Зберегти
      </button>
    </form>
  );
}
