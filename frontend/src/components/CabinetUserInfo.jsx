// components/CabinetUserInfo.jsx
import { useAuth } from "../context/AuthContext";

// Маленька хелпер-функція для красивого форматування дати
const formatDate = (dateString) => {
  if (!dateString) return "Немає даних";
  const date = new Date(dateString);
  return date.toLocaleDateString("uk-UA", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const CabinetUserInfo = () => {
  const { user } = useAuth();
  console.log("Дані користувача в CabinetUserInfo:", user);
  if (!user) {
    return <p>Завантаження даних користувача...</p>;
  }

  // Створюємо ім'я користувача, показуючи email, якщо ім'я не вказано
  const displayName = (user.first_name || user.last_name)
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : user.email.split('@')[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Профіль користувача</h2>
      
      {/* Можна додати логіку для аватара */}
      {/* <img src={user.avatar_url || 'default-avatar.png'} alt="Аватар" className="w-24 h-24 rounded-full mb-4" /> */}
      
      <p className="mb-2"><strong>Ім'я:</strong> {displayName}</p>
      <p className="mb-2"><strong>Email:</strong> {user.email}</p>
      <p className="mb-2"><strong>Роль:</strong> {user.role}</p>
      <p className="mb-2"><strong>Дата реєстрації:</strong> {formatDate(user.user_creation_date)}</p>
      
      <div className="mt-4 border-t pt-4">
        <p><strong>Біографія:</strong> {user.bio || "Не заповнено"}</p>
        <p><strong>Телефон:</strong> {user.phone_number || "Не вказано"}</p>
      </div>
      
      <div className="mt-4">
        <span className={`px-3 py-1 text-sm rounded-full ${user.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          Email {user.confirmed ? `підтверджено ${formatDate(user.email_confirmed_at)}` : "не підтверджено"}
        </span>
      </div>
    </div>
  );
};

export default CabinetUserInfo;
