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
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const response = await api.get(`/saintpaulia/by-name/${encodeURIComponent(name)}`);
        setInitialData(response.data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.response?.data?.detail || "Не вдалося завантажити дані про сорт.");
      }
    };

    fetchVariety();
  }, [name]);

  const handleUpdate = async (updatedData) => {

    setIsSaving(true);
    setError("");
    setSuccessMessage(""); 

    try {
    // Cтворюємо "чистий" об'єкт для відправки даних на сервер
    const {
      id, 
      owner_id,
      record_creation_date,
      verified_by,
      verification_status, // це поле теж не частина схеми оновлення
      verification, // і весь об'єкт верифікації
      photos, // і фото
      ...payload // ...все інше збираємо в новий об'єкт `payload`
    } = updatedData;

    // Відправляємо на бекенд тільки очищені дані
    const response = await api.put(`/saintpaulia/${encodeURIComponent(name)}`, payload);

    const updatedVariety = response.data;
    
    setSuccessMessage(`Зміни збережено до сорту "${updatedVariety.name}".`);

    // Невеличке покращення: навігація одразу на оновлену назву, якщо вона змінилась
    const newName = updatedVariety.name || name; 
    setTimeout(() => {
      navigate(`/variety/${encodeURIComponent(newName)}`, {
        state: { successMessage: `Зміни збережено до сорту "${newName}".` }
      });
    }, 1000);
  } catch (err) {
    console.error("❌ Update error:", err);

    // Показуємо користувачу більш детальну помилку, якщо вона є
    let errorMessage = "Помилка при оновленні сорту.";
    if (err.response?.data?.detail) {
      // Якщо помилка валідації, вона буде масивом
      if (Array.isArray(err.response.data.detail)) {
        errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
      } else {
        errorMessage = err.response.data.detail;
      }
    }
    setError(errorMessage);
  } finally {
      setIsSaving(false);
    }
};

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!initialData) return <p>Завантаження...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Редагувати сорт: {initialData.name}</h1>
      {isSaving && (
        <p style={{ color: "green", fontStyle: "italic", marginBottom: "1rem" }}>
          Збереження даних...
        </p>
      )}
      {successMessage && !isSaving && (
        <p style={{ color: "green", fontStyle: "italic", marginBottom: "1rem" }}>
          {successMessage}
        </p>
      )}
      <VarietyForm initialData={initialData} onSubmit={handleUpdate} isSaving={isSaving} />
    </div>
  );
}
