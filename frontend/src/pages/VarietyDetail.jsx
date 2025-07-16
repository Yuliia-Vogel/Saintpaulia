import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { verifyVariety } from "../services/api";
import { formatDateLocalized } from "../utils/formatDate";

export default function VarietyDetail() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [variety, setVariety] = useState(null);
  const [error, setError] = useState("");
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const [editingVerification, setEditingVerification] = useState(false);
  const [formState, setFormState] = useState({ is_verified: false, verification_note: "" });
  const [loading, setLoading] = useState(false);

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

  const isAdmin =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "superadmin");

  const handleBack = () => {
    if (location.state?.fromSearch) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      setLoading(true);
      const dataToSend = {
        is_verified: formState.is_verified,
        verification_note: formState.verification_note
      };

      const updated = await verifyVariety(name, dataToSend);
      setVariety((prev) => ({
        ...prev,
        is_verified: updated.is_verified,
        verification_note: updated.verification_note,
        verification_date: updated.verification_date,
        verified_by: updated.verified_by,
      }));
      setEditingVerification(false);
    } catch (err) {
      alert("Не вдалося оновити статус верифікації.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!variety) return <p>Завантаження...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {successMessage && (
        <p className="text-green-600 italic mb-4">{successMessage}</p>
      )}
      <button onClick={handleBack} className="text-blue-600 hover:underline mb-4 block">
        ← Назад
      </button>

      <h1 className="text-3xl font-bold mb-4">{variety.name}</h1>

      <div className="space-y-2 text-lg">
        {variety.description && <p><strong>Опис:</strong> {variety.description}</p>}
        <p><strong>Розмір розетки:</strong> {variety.size_category}</p>
        {variety.flower_color && <p><strong>Колір квітів:</strong> {variety.flower_color}</p>}
        {variety.flower_size && <p><strong>Розмір квітів:</strong> {variety.flower_size}</p>}
        {variety.flower_shape && <p><strong>Форма квітів:</strong> {variety.flower_shape}</p>}
        {variety.flower_doubleness && <p><strong>Наповненість квітів:</strong> {variety.flower_doubleness}</p>}
        {variety.blooming_features && <p><strong>Характеристики цвітіння:</strong> {variety.blooming_features}</p>}
        {variety.ruffles !== null && <p><strong>Рюші:</strong> {variety.ruffles ? "Так" : "Ні"}</p>}
        {variety.ruffles && variety.ruffles_color && (
          <p><strong>Колір рюш:</strong> {variety.ruffles_color}</p>
        )}
        {variety.leaf_shape && <p><strong>Форма листків:</strong> {variety.leaf_shape}</p>}
        {variety.leaf_variegation && <p><strong>Строкатість листя:</strong> {variety.leaf_variegation}</p>}
        {variety.selectionist && <p><strong>Селекціонер:</strong> {variety.selectionist}</p>}
        {variety.selection_year && <p><strong>Рік селекції:</strong> {variety.selection_year}</p>}
        {variety.origin && <p><strong>Походження сорту:</strong> {variety.origin}</p>}
        <p><strong>Автор запису (ID):</strong> {variety.owner_id}</p>
        <p><strong>Дата створення запису:</strong> {formatDateLocalized(variety.record_creation_date)}</p>
        <p><strong>Статус сорту:</strong>{" "}
          {variety.is_verified ? (
            <span className="text-green-600 font-semibold">✅ Сорт підтверджено</span>
          ) : (
            <span className="text-yellow-600 font-semibold">🕓 Новий сорт (не підтверджено)</span>
          )}
        </p>
      </div>

      {isAdmin && (
        <div className="mt-6 border-t pt-4">
          <button
            className="text-sm text-blue-700 underline mb-2"
            onClick={() => setShowAdminInfo(!showAdminInfo)}
          >
            {showAdminInfo ? "▲ Приховати верифікаційну інформацію" : "▼ Інформація про підтвердження сорту (адмінам)"}
          </button>

          {showAdminInfo && (
            <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
              <p><strong>Примітка:</strong> {variety.verification?.verification_note || "—"}</p>
              <p><strong>Верифікатор (ID):</strong> {variety.verification?.verified_by || "—"}</p>
              <p><strong>Дата зміни статусу:</strong> {formatDateLocalized(variety.verification?.verification_date)}</p>

              {!editingVerification ? (
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  onClick={() => {
                    setEditingVerification(true);
                    setFormState({
                      is_verified: variety.is_verified,
                      verification_note: variety.verification_note || "",
                    });
                  }}
                >
                  ✏️ Змінити статус верифікації сорту
                </button>
              ) : (
                <div className="mt-4 space-y-2">
                  <label className="block">
                    <span className="text-sm">Примітка до верифікації:</span>
                    <textarea
                      className="w-full border rounded p-2 mt-1"
                      rows={3}
                      value={formState.verification_note}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, verification_note: e.target.value }))
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formState.is_verified}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, is_verified: e.target.checked }))
                      }
                    />
                    <span className="text-sm">Позначити як підтверджений сорт</span>
                  </label>

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleVerificationSubmit}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      disabled={loading}
                    >
                      💾 Зберегти зміни статусу
                    </button>
                    <button
                      onClick={() => setEditingVerification(false)}
                      className="text-gray-600 underline"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {canEdit && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate(`/variety/${variety.name}/edit`)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded"
          >
            ✏️ Редагувати сорт
          </button>
          <button
            onClick={() =>
              navigate(`/variety/${variety.id}/upload-photo`, {
                state: { varietyName: name },
              })
            }
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            📷 Додати фото
          </button>
        </div>
      )}

      {variety.photos.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {variety.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.file_url}
              alt={variety.name}
              className="w-full rounded-xl shadow"
            />
          ))}
        </div>
      )}
    </div>
  );
}
