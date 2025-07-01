// src/pages/EditVariety.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VarietyForm } from "../components/VarietyForm";
import api from "../services/api";

export default function EditVariety() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const response = await api.get(`/saintpaulia/saintpaulias/by-name/${encodeURIComponent(name)}`);
        setInitialData(response.data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.response?.data?.detail || "Не вдалося завантажити дані про сорт.");
      }
    };

    fetchVariety();
  }, [name]);

  const handleUpdate = async (updatedData) => {
    try {
      const response = await api.put(`/saintpaulia/saintpaulias/${encodeURIComponent(name)}`, updatedData);

      const updatedVariety = response.data;

      setSuccessMessage(`Зміни збережено до сорту "${updatedVariety.name}".`);

      setTimeout(() => {
        navigate(`/variety/${encodeURIComponent(updatedVariety.name)}`, {
          state: { successMessage: `Зміни збережено до сорту "${updatedVariety.name}".` }
        });
      }, 1000);
    } catch (err) {
      console.error("❌ Update error:", err);
      setError(err.response?.data?.detail || "Помилка при оновленні сорту.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!initialData) return <p>Завантаження...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Редагувати сорт: {initialData.name}</h1>
      {successMessage && (
        <p style={{ color: "green", fontStyle: "italic", marginBottom: "1rem" }}>
          {successMessage}
        </p>
      )}
      <VarietyForm initialData={initialData} onSubmit={handleUpdate} />
    </div>
  );
}
