// src/pages/admin/DeletedVarietiesPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDeletedVarieties, restoreVariety, finalDeleteVariety } from "../../services/api";
import { toast } from "sonner";
import { formatDateLocalized } from "../../utils/formatDate"; // Припускаю, що у вас є цей хелпер

export default function DeletedVarietiesPage() {
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDeletedVarieties();
  }, []);

  // --- ФУНКЦІЯ ДЛЯ ВІДНОВЛЕННЯ ---
  const handleRestore = (varietyId, varietyName) => {
    toast(`Ви впевнені, що хочете відновити сорт "${varietyName}"?`, {
      action: {
        label: "Так, відновити",
        onClick: async () => {
          try {
            await restoreVariety(varietyId);
            toast.success(`Сорт "${varietyName}" успішно відновлено!`);
            // Оновлюємо стан, щоб сорт зник зі списку без перезавантаження
            setVarieties(prevVarieties => prevVarieties.filter(v => v.id !== varietyId));
          } catch (error) {
            toast.error("Не вдалося відновити сорт.");
            console.error(error);
          }
        },
      },
      cancel: {
        label: "Скасувати",
      },
    });
  };

  // --- ФУНКЦІЯ ДЛЯ ОСТАТОЧНОГО ВИДАЛЕННЯ ---
  const handleFinalDelete = (varietyId, varietyName) => {
    toast.error(`Це НЕЗВОРОТНА дія! Видалити сорт "${varietyName}" НАЗАВЖДИ?`, {
      action: {
        label: "Так, видалити назавжди",
        onClick: async () => {
          try {
            await finalDeleteVariety(varietyId);
            toast.success(`Сорт "${varietyName}" було остаточно видалено.`);
            // Оновлюємо стан
            setVarieties(prevVarieties => prevVarieties.filter(v => v.id !== varietyId));
          } catch (error) {
            toast.error("Не вдалося остаточно видалити сорт.");
            console.error(error);
          }
        },
      },
      cancel: {
        label: "Скасувати",
      },
      duration: 8000,
    });
  };

  if (loading) {
    return <p className="p-4">Завантаження архіву сортів...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Архівні сорти</h1>

      {varieties.length === 0 ? (
        <p>Немає сортів, позначених як видалені.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва сорту</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Автор запису (ID)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {varieties.map((variety) => (
                <tr key={variety.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link to={`/variety/${variety.name}`} className="text-blue-600 hover:underline font-semibold">
                      {variety.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{variety.owner_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => handleRestore(variety.id, variety.name)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Відновити
                    </button>
                    <button
                      onClick={() => handleFinalDelete(variety.id, variety.name)}
                      className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-800"
                    >
                      Видалити назавжди
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
