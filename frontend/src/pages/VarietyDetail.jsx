import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

const API_BASE = "http://localhost:8000/saintpaulia/saintpaulias";

export default function VarietyDetail() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [variety, setVariety] = useState(null);
  const [error, setError] = useState("");

  const fromQuery = location.state?.fromQuery || "";
  const currentUser = useCurrentUser(); // 🔄 заміни на свій спосіб отримання поточного користувача

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const response = await fetch(`${API_BASE}/by-name/${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error("Не вдалося завантажити дані про сорт.");
        const data = await response.json();
        setVariety(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchVariety();
  }, [name]);

  const handleBack = () => {
    if (location.state?.fromSearch) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const canEdit = 
    currentUser &&
    (currentUser.id === variety?.owner_id || // бо owner_id — це email
      ["admin", "superadmin"].includes(currentUser.role));

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!variety) return <p>Завантаження...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => {
          if (fromQuery) {
            navigate(`/?query=${encodeURIComponent(fromQuery)}`);
          } else {
            navigate("/");
          }
        }}
        style={{ marginBottom: "20px" }}
      >
        ← Назад
      </button>

      <h1>{variety.name}</h1>
      <p>
        <strong>Назва сорту:</strong> {variety.name || "Інформація відсутня"}
      </p>
      <p>
        <strong>Опис:</strong> {variety.description || "Інформація відсутня"}
      </p>
      <p>
        <strong>Розмір розетки:</strong>{" "} {variety.size_category || "Інформація відсутня"}
      </p>
      <p>
        <strong>Колір квітів:</strong>{" "} {variety.flower_color || "Інформація відсутня"}
      </p>
      <p>
        <strong>Розмір квітів:</strong>{" "} {variety.flower_size || "Інформація відсутня"}
      </p>
      <p>
        <strong>Форма квітів:</strong>{" "} {variety.flower_shape || "Інформація відсутня"}
      </p>
      <p>
        <strong>Наповненість квітів:</strong>{" "} {variety.flower_doubleness || "Інформація відсутня"}
      </p>
      <p>
        <strong>Характеристики цвітіння:</strong>{" "} {variety.blooming_features || "Інформація відсутня"}
      </p>

      <p>
        <strong>Форма листків:</strong>{" "} {variety.leaf_shape || "Інформація відсутня"}
      </p>
      <p>
        <strong>Строкатість листя:</strong>{" "} {variety.leaf_variegation || "Інформація відсутня"}
      </p>

      <p>
        <strong>Селекціонер:</strong> {variety.selectionist || "Інформація відсутня"}
      </p>
      <p>
        <strong>Рік селекції:</strong> {variety.selection_year || "Інформація відсутня"}
      </p>
      <p>
        <strong>Походження сорту:</strong> {variety.origin || "Інформація відсутня"}
      </p>

      <p>
        <strong>Автор запису:</strong> {variety.owner_id || "Інформація відсутня"}
      </p>
      <p>
        <strong>Дата створення запису:</strong>{" "} {variety.record_creation_date || "Інформація відсутня"}
      </p>

      {/* 🌸 Фото */}
      {variety.photos && variety.photos.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "20px" }}>
          {variety.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.file_url}
              alt={variety.name}
              style={{ maxWidth: "300px", borderRadius: "8px" }}
            />
          ))}
        </div>
      )}

      {/* ✏️ Кнопки для редагування */}
      {canEdit && (
        <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate(`/variety/${variety.name}/edit`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600"
          >
            ✏️ Редагувати сорт
          </button>
          <button
            onClick={() => navigate(`/photos/upload/${variety.id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          >
            📷 Додати фото
          </button>
        </div>
      )}
    </div>
  );
}
