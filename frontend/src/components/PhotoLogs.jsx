// components/PhotoLogs.jsx
import React, { useEffect, useState } from "react";
import { getPhotoLogs } from "../services/api";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const PhotoLogs = ({ varietyId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getPhotoLogs(varietyId);
        setLogs(data);
      } catch (err) {
        console.error("Помилка під час завантаження логів фото:", err);
        setError("Не вдалося завантажити логи.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [varietyId]);

  if (loading) return <p>Завантаження логів фото...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (logs.length === 0) return <p>Немає логів фото для цього сорту.</p>;

  return (
  <div className="mt-4">
    <h2 className="text-lg font-semibold mb-2">Логи фото</h2>
    {error ? (
      <p className="text-red-500 italic">{error}</p>
    ) : logs.length === 0 ? (
      <p className="text-gray-500 italic">Немає логів фото для цього сорту.</p>
    ) : (
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="border-b pb-2">
            <div>
              <span className="font-medium">{log.action}</span> —{" "}
              {new Date(log.timestamp).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{log.user_email}</div>
            <div>
              <img
                src={log.photo_filename}
                alt="Зображення"
                className="mt-2 max-w-xs rounded shadow"
              />
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
};

export default PhotoLogs;
