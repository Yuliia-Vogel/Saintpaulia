// src/pages/admin/DeletedVarietiesPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// --- Імпортуємо ВСІ потрібні функції з api ---
import { 
  getDeletedVarieties, 
  restoreVariety, 
  finalDeleteVariety, 
  bulkRestoreVarieties, 
  bulkFinalDeleteVarieties 
} from "../../services/api";
import { toast } from "sonner";

export default function DeletedVarietiesPage() {
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Функції для завантаження та роботи з чекбоксами ---
  const fetchDeletedVarieties = async () => {
    setLoading(true);
    try {
      const data = await getDeletedVarieties();
      setVarieties(data);
    } catch (error) {
      toast.error("Не вдалося завантажити архівні сорти.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedVarieties();
  }, []);

  const handleSelectOne = (id) => {
    setSelectedIds(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = varieties.map(v => v.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // --- Функції для МАСОВИХ дій ---
  const handleBulkRestore = () => {
    toast(`Відновити ${selectedIds.length} сорт(ів)?`, {
      action: {
        label: "Так, відновити",
        onClick: async () => {
          try {
            const response = await bulkRestoreVarieties(selectedIds);
            toast.success(response.message);
            await fetchDeletedVarieties();
            setSelectedIds([]);
          } catch (error) {
            toast.error("Сталася помилка під час відновлення.");
          }
        },
      },
      cancel: { label: "Скасувати" },
    });
  };

  const handleBulkDelete = () => {
    toast.error(`Остаточно видалити ${selectedIds.length} сорт(ів)? Це НЕЗВОРОТНА дія!`, {
      action: {
        label: "Так, видалити назавжди",
        onClick: async () => {
          try {
            const response = await bulkFinalDeleteVarieties(selectedIds);
            toast.success(response.message);
            await fetchDeletedVarieties();
            setSelectedIds([]);
          } catch (error) {
            toast.error("Сталася помилка під час видалення.");
          }
        },
      },
      cancel: { label: "Скасувати" },
      duration: 8000,
    });
  };

  // --- Функції для ОДИНОЧНИХ дій ---
  const handleRestore = (varietyId, varietyName) => {
    toast(`Ви впевнені, що хочете відновити сорт "${varietyName}"?`, {
      action: {
        label: "Так, відновити",
        onClick: async () => {
          try {
            await restoreVariety(varietyId);
            toast.success(`Сорт "${varietyName}" успішно відновлено!`);
            setVarieties(prev => prev.filter(v => v.id !== varietyId));
          } catch (error) {
            toast.error("Не вдалося відновити сорт.");
          }
        },
      },
      cancel: { label: "Скасувати" },
    });
  };

  const handleFinalDelete = (varietyId, varietyName) => {
    toast.error(`Це НЕЗВОРОТНА дія! Видалити сорт "${varietyName}" НАЗАВЖДИ?`, {
      action: {
        label: "Так, видалити назавжди",
        onClick: async () => {
          try {
            await finalDeleteVariety(varietyId);
            toast.success(`Сорт "${varietyName}" було остаточно видалено.`);
            setVarieties(prev => prev.filter(v => v.id !== varietyId));
          } catch (error) {
            toast.error("Не вдалося остаточно видалити сорт.");
          }
        },
      },
      cancel: { label: "Скасувати" },
      duration: 8000,
    });
  };

  if (loading) {
    return <p className="p-4">Завантаження архіву сортів...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Архівні сорти</h1>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 flex items-center gap-4">
          <p className="font-semibold">Вибрано: {selectedIds.length}</p>
          <button onClick={handleBulkRestore} className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
            Відновити вибрані
          </button>
          <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-700 text-white text-sm rounded hover:bg-red-800">
            Видалити вибрані
          </button>
        </div>
      )}

      {varieties.length === 0 ? (
        <p>Немає сортів, позначених як видалені.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">
                  <input type="checkbox" onChange={handleSelectAll} checked={varieties.length > 0 && selectedIds.length === varieties.length}/>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва сорту</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Автор запису (ID)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {varieties.map((variety) => (
                <tr key={variety.id} className={selectedIds.includes(variety.id) ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-3">
                    <input type="checkbox" onChange={() => handleSelectOne(variety.id)} checked={selectedIds.includes(variety.id)}/>
                  </td>
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
                      Видалити
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