import { useState } from "react";
import { requestConfirmationEmail } from "../services/authService";

export default function EmailConfirmationNotice({ email }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const data = await requestConfirmationEmail(email);
      setMessage(data.message || "Лист надіслано. Перевірте пошту.");
    } catch (error) {
      setMessage("Сталася помилка при надсиланні листа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-md text-sm text-yellow-900 mt-4">
      <p className="font-medium">
        Ваша пошта ще не підтверджена. Будь ласка, перевірте вхідні або натисніть кнопку нижче:
      </p>
      <button
        onClick={handleResend}
        disabled={loading}
        className="mt-2 bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded font-medium"
      >
        {loading ? "Надсилаємо..." : "Надіслати лист повторно"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
