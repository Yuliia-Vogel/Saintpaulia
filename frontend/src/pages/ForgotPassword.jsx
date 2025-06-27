import { useState } from "react";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting forgot password for:", email);
    setMessage("");
    setError("");

    try {
      // 👇 надсилаємо запит до бекенду
      const res = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage("Якщо така пошта існує, інструкції надіслано.");
    } catch (err) {
      console.error(err);
      setError("Щось пішло не так. Спробуйте пізніше.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Забули пароль?</h2>
      {message && <div className="text-green-600 mb-2">{message}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Надіслати інструкції
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
