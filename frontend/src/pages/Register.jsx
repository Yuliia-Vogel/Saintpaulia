import { useState } from "react";
import { useNavigate } from "react-router-dom";

console.log(import.meta.env.VITE_API_URL);

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Паролі не збігаються");
      return;
    }

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Реєстрація успішна! Перевірте пошту для підтвердження.");
        setError("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.detail || "Помилка реєстрації");
      }
    } catch (err) {
      setError("Проблема з сервером або мережею");
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
