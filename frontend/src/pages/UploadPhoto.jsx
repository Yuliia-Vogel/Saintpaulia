// src/pages/UploadPhoto.jsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function UploadPhoto() {
  const { id } = useParams(); // variety.id передається в URL
  const location = useLocation();
  const { varietyName } = location.state || {};
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("variety_id", parseInt(id));

    try {
      const response = await api.post("/photos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Фото успішно завантажено!");

      // Затримка і перенаправлення
      setTimeout(() => {
        navigate(`/variety/${encodeURIComponent(varietyName)}`);
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Помилка завантаження фото.";
      setError(msg);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Завантажити фото для сорту</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={!file}>Завантажити</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
