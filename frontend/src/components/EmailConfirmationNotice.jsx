import { useState } from "react";

export default function EmailConfirmationNotice({ email }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("http://localhost:8000/auth/request-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message || "Лист надіслано.");
    } catch (error) {
      setMessage("Сталася помилка при надсиланні листа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-md text-sm">
      <p>Ваша пошта ще не підтверджена. Будь ласка, перевірте вхідні.</p>
      <button
        onClick={handleResend}
        disabled={loading}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
      >
        {loading ? "Надсилаємо..." : "Надіслати лист повторно"}
      </button>
      {message && <p className="mt-2 text-gray-700">{message}</p>}
    </div>
  );
}
