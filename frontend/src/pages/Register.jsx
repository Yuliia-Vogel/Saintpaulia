// src/pages/Register.jsx
import { useState } from "react";
import { register } from "../services/authService";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // НЕ ПОТРІБЕН: const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Скидаємо помилку на початку
    setMessage(""); // Скидаємо повідомлення на початку

    if (password !== confirmPassword) {
      setError("Паролі не збігаються");
      return;
    }

    try {
      // Викликаємо нашу централізовану функцію з authService
      const data = await register(email, password);

      // Якщо реєстрація пройшла успішно
      setMessage(data.message || "Реєстрація успішна! Перевірте пошту для підтвердження.");
      setError("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      // Обробляємо помилки, що прийшли з бекенду
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Проблема з сервером або мережею. Спробуйте пізніше.");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Реєстрація</h2>

      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className="w-full p-2 border rounded pr-16"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Сховати" : "Показати"}
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-1">Підтвердіть пароль</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Підтвердіть пароль"
              className="w-full p-2 border rounded pr-16"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "Сховати" : "Показати"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Зареєструватися
        </button>
      </form>
    </div>
  );
}

export default Register;