// src/components/VarietyLogs.jsx
import { useEffect, useState } from "react";
import { getVarietyLogs } from "../services/api";
import formatDate from "../utils/formatDate";

const VarietyLogs = ({ varietyId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("▶️ varietyId перед запитом:", varietyId);
    getVarietyLogs(varietyId)
      .then(setLogs)
      .catch((err) => {
      console.error("❌ Помилка при завантаженні логів:", err);
      console.log("↪️ Код статусу:", err.response?.status);
      console.log("↪️ Тіло відповіді:", err.response?.data);
        setError("Не вдалося завантажити логи.");
      })
      .finally(() => setLoading(false));
  }, [varietyId]);

  if (loading) return <p>Завантаження логів...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (logs.length === 0) return <p>Немає логів для цього сорту.</p>;

  return (
    <table className="w-full table-auto border mt-2">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-2 border">Дата</th>
          <th className="p-2 border">Користувач</th>
          <th className="p-2 border">Дія</th>
          <th className="p-2 border">Деталі</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td className="p-2 border">{formatDate(log.timestamp)}</td>
            <td className="p-2 border">{log.user?.email || "—"}</td>
            <td className="p-2 border">{log.action}</td>
            <td className="p-2 border">
              {log.photo_filename ? (
                <a
                  href={log.photo_filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Фото
                </a>
              ) : (
                log.details || "-"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VarietyLogs;
