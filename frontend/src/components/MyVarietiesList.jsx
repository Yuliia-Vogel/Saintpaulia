// components/MyVarietiesList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PaginationControls from "./PaginationControls";
import { Link } from "react-router-dom";

const MyVarietiesList = () => {
  const { user } = useAuth();
  const [varieties, setVarieties] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyVarieties = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE_URL}/saintpaulia/saintpaulias/my-varieties/?limit=${limit}&offset=${offset}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Помилка при завантаженні сортів.");
      }

      const data = await res.json();
      setVarieties(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Невідома помилка.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVarieties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  if (!user) return null;
  if (loading) return <p>⏳ Завантаження...</p>;
  if (error) return <p className="text-red-600">❌ {error}</p>;
  if (varieties.length === 0) return <p>Сортів поки немає.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">🌱 Мої сорти</h2>
      <ul className="space-y-2">
        {varieties.map((v) => (
          <li
            key={v.id}
            className="p-3 rounded border hover:shadow bg-white"
          >
            <Link to={`/variety/${v.name}`} className="text-blue-600 hover:underline">
              {v.name}
            </Link>
            {v.description && <p className="text-sm text-gray-600">{v.description}</p>}
          </li>
        ))}
      </ul>
      <PaginationControls
        currentPage={Math.floor(offset / limit) + 1}
        totalItems={total}
        itemsPerPage={limit}
        onPageChange={(newPage) => setOffset((newPage - 1) * limit)}
      />
    </div>
  );
};

export default MyVarietiesList;
