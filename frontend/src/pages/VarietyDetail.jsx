import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function VarietyDetail() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [variety, setVariety] = useState(null);
  const [error, setError] = useState("");
  const fromQuery = location.state?.fromQuery || "";
  const successMessage = location.state?.successMessage;

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const response = await api.get(`/saintpaulia/saintpaulias/by-name/${encodeURIComponent(name)}`);
        setVariety(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Не вдалося завантажити дані про сорт.");
      }
    };

    fetchVariety();
  }, [name]);

  const canEdit =
    currentUser &&
    variety &&
    (
      currentUser.user_id === variety?.owner_id ||
      currentUser.role === "admin" ||
      currentUser.role === "superadmin"
    );

  const handleBack = () => {
    if (location.state?.fromSearch) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!variety) return <p>Завантаження...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {successMessage && (
        <p style={{ color: "green", fontStyle: "italic", marginBottom: "1rem" }}>
          {successMessage}
        </p>
      )}
      <button onClick={handleBack} style={{ marginBottom: "20px" }}>
        ← Назад
      </button>

      <h1>{variety.name}</h1>
      <p><strong>Назва сорту:</strong> {variety.name || "Інформація відсутня"}</p>
      <p><strong>Опис:</strong> {variety.description || "Інформація відсутня"}</p>
      <p><strong>Розмір розетки:</strong> {variety.size_category || "Інформація відсутня"}</p>
      <p><strong>Колір квітів:</strong> {variety.flower_color || "Інформація відсутня"}</p>
      <p><strong>Розмір квітів:</strong> {variety.flower_size || "Інформація відсутня"}</p>
      <p><strong>Форма квітів:</strong> {variety.flower_shape || "Інформація відсутня"}</p>
      <p><strong>Наповненість квітів:</strong> {variety.flower_doubleness || "Інформація відсутня"}</p>
      <p><strong>Характеристики цвітіння:</strong> {variety.blooming_features || "Інформація відсутня"}</p>
      <p><strong>Рюші:</strong>{" "}
        {variety.ruffles === true
          ? "Так"
          : variety.ruffles === false
          ? "Ні"
          : "Інформація відсутня"}
      </p>

      {variety.ruffles === true && variety.ruffles_color && (
        <p>
          <strong>Колір рюш:</strong> {variety.ruffles_color}
        </p>
      )}
      <p><strong>Форма листків:</strong> {variety.leaf_shape || "Інформація відсутня"}</p>
      <p><strong>Строкатість листя:</strong> {variety.leaf_variegation || "Інформація відсутня"}</p>
      <p><strong>Селекціонер:</strong> {variety.selectionist || "Інформація відсутня"}</p>
      <p><strong>Рік селекції:</strong> {variety.selection_year || "Інформація відсутня"}</p>
      <p><strong>Походження сорту:</strong> {variety.origin || "Інформація відсутня"}</p>
      <p><strong>Автор запису:</strong> {variety.owner_id || "Інформація відсутня"}</p>
      <p><strong>Дата створення запису:</strong> {variety.record_creation_date || "Інформація відсутня"}</p>

      {canEdit && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => navigate(`/variety/${variety.name}/edit`)}>
            ✏️ Редагувати сорт
          </button>
          <button onClick={() => navigate(`/variety/${variety.id}/upload-photo`, { state: { varietyName: name } })}>
            📷 Додати фото
          </button>
        </div>
      )}

      {variety.photos.length > 0 && (
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
    </div>
  );
}
