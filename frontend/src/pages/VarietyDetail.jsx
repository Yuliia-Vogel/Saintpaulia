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

      {variety.name && <p><strong>Назва сорту:</strong> {variety.name}</p>}
      {variety.description && <p><strong>Опис:</strong> {variety.description}</p>}
      {variety.size_category && <p><strong>Розмір розетки:</strong> {variety.size_category}</p>}
      {variety.flower_color && <p><strong>Колір квітів:</strong> {variety.flower_color}</p>}
      {variety.flower_size && <p><strong>Розмір квітів:</strong> {variety.flower_size}</p>}
      {variety.flower_shape && <p><strong>Форма квітів:</strong> {variety.flower_shape}</p>}
      {variety.flower_doubleness && <p><strong>Наповненість квітів:</strong> {variety.flower_doubleness}</p>}
      {variety.blooming_features && <p><strong>Характеристики цвітіння:</strong> {variety.blooming_features}</p>}

      {/* Рюші — спеціальна обробка */}
      {variety.ruffles === true && <p><strong>Рюші:</strong> Так</p>}
      {variety.ruffles === false && <p><strong>Рюші:</strong> Ні</p>}

      {/* Колір рюш — тільки якщо рюші є */}
      {variety.ruffles === true && variety.ruffles_color && (
        <p><strong>Колір рюш:</strong> {variety.ruffles_color}</p>
      )}

      {variety.leaf_shape && <p><strong>Форма листків:</strong> {variety.leaf_shape}</p>}
      {variety.leaf_variegation && <p><strong>Строкатість листя:</strong> {variety.leaf_variegation}</p>}
      {variety.selectionist && <p><strong>Селекціонер:</strong> {variety.selectionist}</p>}
      {variety.selection_year && <p><strong>Рік селекції:</strong> {variety.selection_year}</p>}
      {variety.origin && <p><strong>Походження сорту:</strong> {variety.origin}</p>}
      {variety.owner_id && <p><strong>Автор запису:</strong> {variety.owner_id}</p>}
      {variety.record_creation_date && <p><strong>Дата створення запису:</strong> {variety.record_creation_date}</p>}


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
