// src/pages/EditVariety.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VarietyForm } from "./VarietyForm";

const API_BASE = "http://localhost:8000/saintpaulia/saintpaulias";

export default function EditVariety() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const response = await fetch(`${API_BASE}/by-name/${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error("Не вдалося завантажити дані про сорт.");
        const data = await response.json();
        setInitialData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchVariety();
  }, [name]);

  const handleUpdate = async (updatedData) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Потрібна авторизація.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(name)}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Помилка при оновленні сорту.");
      }

      const updatedVariety = await response.json();
      navigate(`/variety/${encodeURIComponent(updatedVariety.name)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!initialData) return <p>Завантаження...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Редагувати сорт: {initialData.name}</h1>
      <VarietyForm initialData={initialData} onSubmit={handleUpdate} />
    </div>
  );
}
