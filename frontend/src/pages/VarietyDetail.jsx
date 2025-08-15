import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { verifyVariety, deleteVariety } from "../services/api";
import { formatDateLocalized } from "../utils/formatDate";
import VarietyLogs from "../components/VarietyLogs"; 
import PhotoLogs from "../components/PhotoLogs";
import { toast } from 'sonner';


export default function VarietyDetail() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [variety, setVariety] = useState(null);
  const [error, setError] = useState("");
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const [editingVerification, setEditingVerification] = useState(false);
  const [formState, setFormState] = useState({ verification_status: false, verification_note: "" });
  const [loading, setLoading] = useState(false);

  const fromQuery = location.state?.fromQuery || "";
  const successMessage = location.state?.successMessage;

  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchVariety = async () => {
      try {
        const response = await api.get(`/saintpaulia/by-name/${encodeURIComponent(name)}`);
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
        verification_status: formState.verification_status,
        verification_note: formState.verification_note
      };

      const updatedVerificationData = await verifyVariety(name, dataToSend);
        setVariety((prev) => ({
          ...prev, // Копіюємо всі старі властивості сорту
          verification: { // Повністю оновлюємо об'єкт верифікації
            ...prev.verification, // Можна зберегти старі дані, якщо API повертає не все
            ...updatedVerificationData, // І перезаписуємо їх свіжими даними з відповіді API
          },
        }));
      setEditingVerification(false);
    } catch (err) {
      alert("Не вдалося оновити статус верифікації.");
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = () => {
    toast("Ти справді хочеш видалити цей сорт?", {
      action: {
        label: "Так, я впевнена",
        onClick: () => {
          console.log ("Soft delete initiated by:", currentUser.role),
          toast("Це остаточне підтвердження. Видалити сорт безповоротно?", {
            action: {
              label: "Видалити",
              onClick: async () => {
                try {
                  await deleteVariety(variety.name);
                  toast.success("Сорт успішно позначено як видалений");
                  navigate("/");
                } catch (error) {
                  toast.error("Не вдалося видалити сорт");
                  console.error(error);
                }
              },
            },
            cancel: {
              label: "Скасувати",
            },
            duration: 8000,
          });
        },
      },
      cancel: {
        label: "Скасувати",
      },
      duration: 8000,
    });
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

      {/* Кнопки табів */}
      <div className="flex space-x-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`pb-2 border-b-2 ${
            activeTab === "info" ? "border-blue-500 text-blue-600 font-semibold" : "border-transparent text-gray-600"
          }`}
        >
          ℹ️ Інфо
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-2 border-b-2 ${
              activeTab === "logs" ? "border-blue-500 text-blue-600 font-semibold" : "border-transparent text-gray-600"
            }`}
          >
            📜 Логи
          </button>
        )}
          {isAdmin && (
            <button
              onClick={() => setActiveTab("photoLogs")}
              className={`pb-2 border-b-2 ${
                activeTab === "photoLogs" ? "border-blue-500 text-blue-600 font-semibold" : "border-transparent text-gray-600"
              }`}
            >
              🖼️ Логи фото
            </button>
          )}
      </div>

      {/* Таб "Інфо" */}
      {activeTab === "info" && (
        <div>
          {/* Інформація про сорт */}
          <div className="space-y-2 text-lg mb-6">
            {variety.description && <p><strong>Опис:</strong> {variety.description}</p>}
            {variety.size_category && <p><strong>Розмір розетки:</strong> {variety.size_category}</p>}
            {variety.growth_type && <p><strong>Тип росту:</strong> {variety.growth_type}</p>}
            
            {variety.main_flower_color && <p><strong>Основний колір квітки:</strong> {variety.main_flower_color}</p>}
            {variety.flower_color_type && <p><strong>Тип окрасу квітки:</strong> {variety.flower_color_type}</p>}
            {variety.flower_edge_color && <p><strong>Облямівка квітки:</strong> {variety.flower_edge_color}</p>}
            {variety.ruffles !== null && <p><strong>Рюші:</strong> {variety.ruffles ? "Так" : "Ні"}</p>}
            {variety.ruffles && variety.ruffles_color && (
              <p><strong>Колір рюш:</strong> {variety.ruffles_color}</p>
            )}
            {variety.flower_colors_all && <p><strong>Всі кольори квітки:</strong> {variety.flower_colors_all}</p>}
            {variety.flower_size && <p><strong>Розмір квітів:</strong> {variety.flower_size}</p>}
            {variety.flower_shape && <p><strong>Форма квітів:</strong> {variety.flower_shape}</p>}
            {variety.petals_shape && <p><strong>Форма пелюсток:</strong> {variety.petals_shape}</p>}
            {variety.flower_doubleness && <p><strong>Наповненість квітів:</strong> {variety.flower_doubleness}</p>}
            {variety.blooming_features && <p><strong>Характеристики цвітіння:</strong> {variety.blooming_features}</p>}
            
            {variety.leaf_shape && <p><strong>Форма листків:</strong> {variety.leaf_shape}</p>}
            {variety.leaf_variegation && <p><strong>Строкатість листя:</strong> {variety.leaf_variegation}</p>}
            {variety.leaf_color_type && <p><strong>Тип окрасу листка:</strong> {variety.leaf_color_type}</p>}
            {variety.leaf_features && <p><strong>Характеристики листя:</strong> {variety.leaf_features}</p>}
            
            {variety.origin && <p><strong>Походження сорту:</strong> {variety.origin}</p>}
            {variety.breeder && <p><strong>Селекціонер:</strong> {variety.breeder}</p>}
            {variety.breeder_origin_country && <p>- {variety.breeder_origin_country}</p>}
            {variety.selection_year && <p><strong>Рік селекції:</strong> {variety.selection_year}</p>}
            
            <p><strong>Автор запису (ID):</strong> {variety.owner_id}</p>
            <p><strong>Дата створення запису:</strong> {formatDateLocalized(variety.record_creation_date)}</p>
            {/* Верифікація — якщо є */}
            <p><strong>Статус сорту:</strong>{" "}
              {variety.verification?.verification_status === 'verified' ? ( 
                <span className="text-green-600 font-semibold">✅ Сорт підтверджено</span>
              ) : (
                <span className="text-yellow-600 font-semibold">🕓 Новий сорт (не підтверджено)</span>
              )}
            </p>
          </div>

          {/* Кнопки дій - розташовуємо ПІД інформацією про сорт */}
          {canEdit && (
            <div className="mb-6 flex gap-4">
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
              <button
                onClick={handleSoftDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                🗑️ Видалити сорт
              </button>
            </div>
          )}

          {/* Адміністративна інформація про верифікацію */}
          {isAdmin && (
            <div className="mb-6 border-t pt-4">
              <button
                className="text-sm text-blue-700 underline mb-2"
                onClick={() => setShowAdminInfo(!showAdminInfo)}>
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
                          // ✅ Правильно звертаємось до вкладеного об'єкта `verification`
                          // ✅ Конвертуємо статус "verified" у boolean `true` для чекбокса
                          verification_status: variety.verification.verification_status === 'verified',
                          // ✅ Правильно звертаємось до вкладеної нотатки
                          verification_note: variety.verification.verification_note || "",
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
                          checked={formState.verification_status}
                          onChange={(e) =>
                            setFormState((prev) => ({ ...prev, verification_status: e.target.checked }))
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

          {/* Фотографії сорту */}
          {variety.photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      )}

      {/* Таб "Логи" */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Логи змін</h2>
          <VarietyLogs varietyId={variety.id} />
        </div>
      )}
            {/* Таб "Логи фото" */}
            {activeTab === "photoLogs" && (
        <div className="space-y-6">

          <h2 className="text-lg font-semibold mt-6">Логи фото</h2>
          <PhotoLogs varietyId={variety.id} />
        </div>
      )}
    </div>
  );
}