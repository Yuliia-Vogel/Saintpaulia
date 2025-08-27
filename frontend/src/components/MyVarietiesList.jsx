// components/MyVarietiesList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PaginationControls from "./PaginationControls";
import { Link } from "react-router-dom";
import api from "../services/api";
import VarietyListItem from "./VarietyListItem";

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

      const res = await api.get(`/saintpaulia/my-varieties/`, {
        params: { limit, offset },
      });

      setVarieties(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Помилка завантаження сортів:", err);
      setError(err.response?.data?.detail || "Невідома помилка.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyVarieties();
  }, [offset]);

  if (!user) return null;
  if (loading) return <p>⏳ Завантаження...</p>;
  if (error) return <p className="text-red-600">❌ {error}</p>;
  if (varieties.length === 0) return <p>Сортів поки немає.</p>;

  return (
    <div>
      {/* <h2 className="text-xl font-semibold mb-3">🌱Ку-ку! Мої сорти</h2> */}
      <ul className="space-y-4">
      {varieties.length > 0 ? (
        varieties.map(variety => (
          <VarietyListItem key={variety.id} variety={variety} />
        ))
      ) : (
        <p>Ви ще не додали жодного сорту.</p>
      )}
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
