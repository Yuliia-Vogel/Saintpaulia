import { useState } from 'react';

export default function VarietyForm({ initialData = {}, onSubmit }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    leaf: initialData.leaf || '',
    flower: initialData.flower || '',
    description: initialData.description || '',
    origin: initialData.origin || '',
    breeder: initialData.breeder || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-4 border rounded-2xl shadow bg-white"
    >
      {[
        ['name', 'Назва сорту'],
        ['description', 'Опис'],
        ['size_category', 'Розмір розетки'],
        ['flower_color', 'Колір квітів'],
        ['flower_size', 'Розмір квітів'],
        ['flower_shape', 'Форма квітів'],
        ['flower_doubleness', 'Наповненість квітів'],
        ['blooming_features', 'Характеристики цвітіння'],
        ['leaf_shape', 'Форма листків'],
        ['leaf_variegation', 'Строкатість листя'],
        ['selectionist', 'Селекціонер'],
        ['selection_year', 'Рік селекції'],
        ['origin', 'Походження сорту'],
        ['owner_id', 'Автор запису'],
        ['record_creation_date', 'Дата створення запису'],
      ].map(([field, label]) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type="text"
            name={field}
            id={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring focus:ring-violet-300 focus:outline-none"
          />
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
