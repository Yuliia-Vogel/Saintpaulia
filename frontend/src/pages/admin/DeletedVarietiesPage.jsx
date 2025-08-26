// src/pages/admin/DeletedVarietiesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDeletedVarieties } from "../../services/api"; // Імпортуємо нашу нову функцію
import { toast } from "sonner";

export default function DeletedVarietiesPage() {
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeletedVarieties = async () => {
      try {
        const data = await getDeletedVarieties();
        setVarieties(data);
      } catch (error) {
        toast.error("Не вдалося завантажити архівні сорти. Можливо, у вас недостатньо прав.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedVarieties();
  }, []);

  if (loading) {
    return <p className="p-4">Завантаження архіву сортів...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Архівні сорти (м'яке видалення)</h1>

      {varieties.length === 0 ? (
        <p>Немає сортів, позначених як видалені.</p>
      ) : (
        <ul className="space-y-2">
          {varieties.map((variety) => (
            <li key={variety.id} className="p-3 bg-gray-100 rounded shadow-sm">
              <Link
                to={`/variety/${encodeURIComponent(variety.name)}`}
                className="font-semibold text-blue-700 hover:underline"
              >
                {variety.name}
              </Link>
              <p className="text-sm text-gray-600">
                ID: {variety.id}, Селекціонер: {variety.breeder || "не вказано"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}