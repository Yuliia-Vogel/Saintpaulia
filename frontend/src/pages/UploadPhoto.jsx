// src/pages/UploadPhoto.jsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function UploadPhoto() {
  const { id } = useParams(); // variety.id передається в URL
  const location = useLocation();
  const { varietyName } = location.state || {};
//   const { name } = useParams();
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

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Потрібна авторизація.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("variety_id", parseInt(id));

    try {
      const response = await fetch("http://localhost:8000/photos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Помилка завантаження фото.");
      }

    //   const result = 
      await response.json();
      setMessage("Фото успішно завантажено!");
      // затримка і повернення
      setTimeout(() => {
        navigate(`/variety/${encodeURIComponent((varietyName))}`);
        // navigate(`/variety/${encodeURIComponent(name)}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
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
