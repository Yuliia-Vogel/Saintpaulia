// src/pages/admin/DeletedVarietiesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDeletedVarieties } from "../../services/api"; // Імпортуємо нашу нову функцію
import VarietyListItem from "../../components/VarietyListItem";
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
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 ">Архівні сорти (м'яке видалення)</h1>

      {varieties.length === 0 ? (
        <p>Немає сортів, позначених як видалені.</p>
      ) : (
        <ul className="space-y-4">
          {varieties.map((variety) => (
            <VarietyListItem key={variety.id} variety={variety} />
          ))}
        </ul>
      )}
    </div>
  );
}