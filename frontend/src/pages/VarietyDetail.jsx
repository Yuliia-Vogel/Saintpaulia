// VarietyDetail.jsx
import PlaceholderImage from '../assets/placeholder.png';
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { verifyVariety, deleteVariety, restoreVariety, finalDeleteVariety, deletePhoto } from "../services/api";
import { formatDateLocalized } from "../utils/formatDate";
import VarietyLogs from "../components/VarietyLogs"; 
import PhotoLogs from "../components/PhotoLogs";
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from "lucide-react"; // гарні іконки


// Допоміжна функція для перевірки URL (ця ф-ція є в компоненті VarietyListItem, можна винести в utils)
function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

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
  const [lightboxPhoto, setLightboxPhoto] = useState(null); // Стан для URL фото в лайтбоксі

  const [activeTab, setActiveTab] = useState("info");
  const [showDetails, setShowDetails] = useState(false);
   // Safe guard для Link
  const SafeLink = ({ to, children, ...props }) => {
    if (RouterLink) {
      return (
        <RouterLink to={to} {...props}>
          {children}
        </RouterLink>
      );
    }
    return (
      <a href={to} {...props}>
        {children}
      </a>
    );
  };

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

  const handleRestore = () => {
    toast("Ви впевнені, що хочете відновити цей сорт?", {
      action: {
        label: "Так, відновити",
        onClick: async () => {
          try {
            await restoreVariety(variety.id); // Використовуємо ID сорту
            toast.success(`Сорт "${variety.name}" успішно відновлено!`);
            // Оновлюємо стан локально, щоб UI миттєво відреагував
            setVariety(prevVariety => ({
              ...prevVariety,
              is_deleted: false, 
            }));
          } catch (error) {
            toast.error("Не вдалося відновити сорт.");
            console.error(error);
          }
        },
      },
      cancel: {
        label: "Скасувати",
      },
    });
  };

  const handleFinalDelete = () => {
    // Використовуємо sonner/toast для багатокрокового підтвердження
    toast.error("Це НЕЗВОРОТНА дія! Сорт буде видалено НАЗАВЖДИ.", {
      action: {
        label: "Я розумію, продовжити",
        onClick: () => {
          toast.error("Останнє попередження: Ви впевнені, що хочете видалити цей сорт з бази даних?", {
            action: {
              label: "Так, видалити НАЗАВЖДИ",
              onClick: async () => {
                try {
                  // Викликаємо нашу нову функцію з api.js
                  await finalDeleteVariety(variety.id); // <-- ВИКОРИСТОВУЄМО ID
                  toast.success(`Сорт "${variety.name}" було остаточно видалено.`);
                  navigate("/"); // Перенаправляємо на головну
                } catch (error) {
                  toast.error("Не вдалося остаточно видалити сорт.");
                  console.error(error);
                }
              },
            },
            cancel: {
              label: "Скасувати",
            },
            duration: 10000, // Даємо більше часу на роздуми
          });
        },
      },
      cancel: {
        label: "Скасувати",
      },
      duration: 10000,
    });
  };

  const handleDeletePhoto = (photoId) => {
    toast("Ви впевнені, що хочете видалити це фото?", {
      action: {
        label: "Так, видалити",
        onClick: async () => {
          try {
            await deletePhoto(photoId);
            toast.success("Фото успішно видалено!");
            
            // оновлюємо стан, щоб фото зникло з UI без перезавантаження сторінки.
            setVariety(prevVariety => ({
              ...prevVariety,
              photos: prevVariety.photos.filter(photo => photo.id !== photoId),
            }));

          } catch (error) {
            toast.error("Не вдалося видалити фото.");
            console.error("Помилка видалення фото:", error);
          }
        },
      },
      cancel: {
        label: "Скасувати",
      },
      duration: 5000,
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

      {/* <-- Індикатор, що сорт в архіві --> */}
      {variety.is_deleted && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          <strong>Увага!</strong> Цей сорт знаходиться в архіві (позначений як видалений).
        </div>
      )}

{/* Фото сорту у верхній частині або заглушка */}
      <div className="mb-2">
        {variety.photos && variety.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {variety.photos.map((photo) => {
              // --- Логіка видимості кнопки для конкретного фото ---
              const canDeletePhoto = currentUser && (
                // Перевіряємо, чи ID поточного користувача співпадає з ID того, хто завантажив фото
                currentUser.user_id === photo.user_id || 
                // Або чи є користувач адміном/суперадміном
                currentUser.role === "admin" || 
                currentUser.role === "superadmin"
              );

              return (
                // Використовуємо relative-позиціонування для батьківського блоку
                <div key={photo.id} className="relative group flex flex-col">
                  <img
                    src={photo.file_url}
                    alt={variety.name}
                    className="w-full rounded-xl shadow cursor-pointer aspect-square object-cover"
                    onClick={() => setLightboxPhoto(photo.file_url)}
                  />
                  
                  {/* --- Умовний рендеринг кнопки --- */}
                  {canDeletePhoto && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      // Стилізуємо кнопку, щоб вона з'являлася, наприклад, в кутку фото
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full 
                                opacity-0 group-hover:opacity-100 transition-opacity 
                                hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Видалити фото"
                    >
                      {/* Іконка кошика для кращого UX */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          ) : (
            // Блок для відображення заглушки
            <div className="flex justify-center items-center w-48 h-48 bg-gray-100 rounded-xl shadow overflow-hidden aspect-square">
              <img
                src={PlaceholderImage}
                alt="Фото відсутнє"
                className="w-48 h-48 object-contain opacity-75"
              />
            </div>
          )}
        </div>

        {/* Блок з інформацією про джерело фото */}
        {(() => {
          const sourceText = variety.photo_source ? variety.photo_source.trim() : '';
          if (!sourceText) return null; // Якщо тексту немає, нічого не відображаємо

          const isSourceUrl = isValidHttpUrl(sourceText);

          return (
            <p className="mt-2 text-xs text-gray-600 leading-tight">
              * Матеріали подані лише з інформаційною метою та з повагою до авторів.
              Джерело фото:{" "}
              {isSourceUrl ? (
                <SafeLink
                  to={sourceText}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-normal"
                >
                  {sourceText}
                </SafeLink>
              ) : (
                <span>{sourceText}</span>
              )}
            </p>
          );
        })()}

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

          <div className="space-y-2 text-lg mb-6">
            {variety.description && <p><strong>Опис:</strong> {variety.description}</p>}
          </div>
          
      {/* Кнопка для розгортання */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        {showDetails ? (
          <>
            <ChevronUp size={18} /> Сховати деталі
          </>
        ) : (
          <>
            <ChevronDown size={18} /> Показати деталі
          </>
        )}
      </button>

      {/* Прихована детальна інформація */}
      {showDetails && (
          <div className="space-y-2 text-lg mb-6">
            {variety.size_category && <p><strong>Розмір розетки:</strong> {variety.size_category}</p>}
            {variety.growth_type && <p><strong>Тип росту:</strong> {variety.growth_type}</p>}
            
            {variety.main_flower_color && <p><strong>Основний колір квітки:</strong> {variety.main_flower_color}</p>}
            {variety.flower_color_type && <p><strong>Тип окрасу квітки:</strong> {variety.flower_color_type}</p>}
            {variety.flower_edge_color && <p><strong>Облямівка квітки:</strong> {variety.flower_edge_color}</p>}
            {variety.ruffles && <p><strong>Рюші:</strong> {variety.ruffles}</p>}
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
            {variety.leaf_features && <p><strong>Особливості листя:</strong> {variety.leaf_features}</p>}
            
            {variety.origin && <p><strong>Походження сорту:</strong> {variety.origin}</p>}
            {variety.breeder && <p><strong>Селекціонер:</strong> {variety.breeder}</p>}
            {variety.breeder_origin_country && <p>- {variety.breeder_origin_country}</p>}
            {variety.selection_year && <p><strong>Рік селекції:</strong> {variety.selection_year}</p>}
            {variety.data_source && <p><strong>Джерела: </strong> {variety.data_source}</p>}
            
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
            <p> 
              Питання по верифікації сорту? Звертайтесь через{" "} 
              <SafeLink to="/contact-info" className="text-purple-600 hover:underline"> сторінку контактів </SafeLink>. 
            </p>
          </div>
      )}

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
                    state: { varietyName: variety.name }, // varietyName для красивого заголовку на сторінці
                  })
                }
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                📷 Додати фото
              </button> 
              {/* Умовний рендеринг кнопок видалення/відновлення --> */}              
              {variety.is_deleted ? (
                // Якщо сорт видалено, показуємо кнопку "Відновити" (лише для адмінів)
                isAdmin && (
                  <button
                    onClick={handleRestore}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    ♻️ Відновити сорт
                  </button>
                )
              ) : (
                // Інакше показуємо звичайну кнопку "Видалити"
                <button
                  onClick={handleSoftDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  🗑️ Видалити сорт
                </button>
              )}
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
                    <div className="mt-6 border-t border-red-300 pt-4">
                      <h3 className="text-md font-semibold text-red-700">Небезпечна зона</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Ця дія остаточно видалить сорт з бази даних без можливості відновлення.
                      </p>
                      <button
                        onClick={handleFinalDelete}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
                      >
                        🔥 Остаточно видалити сорт
                      </button>
                    </div>
                </div>
              )}
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
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Збільшене фото сорту"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}