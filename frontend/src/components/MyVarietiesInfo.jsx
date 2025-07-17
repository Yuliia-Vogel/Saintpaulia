// components/MyVarietiesInfo.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../services/api"; 

const MyVarietiesInfo = () => {
  const { user } = useAuth();
  const [total, setTotal] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTotal = async () => {
      if (!user) return;
      try {
        const res = await api.get("/saintpaulia/my-varieties/?limit=1&offset=0");

        setTotal(res.data.total);
      } catch (err) {
        console.error("Помилка завантаження кількості сортів:", err);
        setError(err.response?.data?.detail || "Невідома помилка.");
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
