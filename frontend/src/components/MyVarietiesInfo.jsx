// components/MyVarietiesInfo.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const MyVarietiesInfo = () => {
  const { user } = useAuth();
  const [total, setTotal] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTotal = async () => {
      if (!user) return;
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE_URL}/saintpaulia/saintpaulias/my-varieties/?limit=1&offset=0`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Не вдалося отримати інформацію про сорти.");
        }

        const data = await res.json();
        setTotal(data.total);
      } catch (err) {
        setError(err.message || "Невідома помилка.");
      }
    };

    fetchTotal();
  }, [user]);

  if (!user) return null;
  if (error) return <p className="text-red-600">❌ {error}</p>;
  if (total === null) return <p>⏳ Завантаження інформації...</p>;

  return (
    <p className="mt-4">
      Ваших сортів в базі:{" "}
      <Link
        to="/my-varieties"
        className="text-blue-600 font-semibold hover:underline"
      >
        {total}
      </Link>
    </p>
  );
};

export default MyVarietiesInfo;
