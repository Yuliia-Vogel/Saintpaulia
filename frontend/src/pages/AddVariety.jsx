// src/pages/AddVariety.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddVariety() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leaf: "",
    flower: "",
    breeder: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Потрібна авторизація.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/saintpaulia/saintpaulias/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Помилка при створенні сорту.");
      }

      const newVariety = await response.json();
      navigate(`/variety/${encodeURIComponent(newVariety.name)}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Додати новий сорт</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Назва:</label><br />
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Опис:</label><br />
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <label>Листя:</label><br />
          <input type="text" name="leaf" value={formData.leaf} onChange={handleChange} />
        </div>
        <div>
          <label>Квітка:</label><br />
          <input type="text" name="flower" value={formData.flower} onChange={handleChange} />
        </div>
        <div>
          <label>Селекціонер:</label><br />
          <input type="text" name="breeder" value={formData.breeder} onChange={handleChange} />
        </div>
        <button type="submit">Зберегти</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
