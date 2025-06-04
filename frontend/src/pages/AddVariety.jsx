// src/pages/AddVariety.jsx
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddVariety() {
  // Debug JWT token
  const token = localStorage.getItem("accessToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("🔍 JWT Token Contents:", decoded);
      console.log("📧 Email:", decoded.sub);
      console.log("👤 Role:", decoded.role);
      console.log("✅ Confirmed:", decoded.confirmed);
      console.log("⏰ Token expires:", new Date(decoded.exp * 1000));
    } catch (e) {
      console.error("❌ Error decoding token:", e);
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size_category: "",
    flower_color: "",
    flower_size: "",
    flower_shape: "",
    flower_doubleness: "",
    blooming_features: "",
    leaf_shape: "",
    leaf_variegation: "",
    selectionist: "",
    selection_year: "",
    origin: "",
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

    // Debug info
    console.log("🔑 Using token:", token.substring(0, 50) + "...");
    console.log("🚀 Sending request to:", "http://localhost:8000/saintpaulia/saintpaulias/");
    console.log("📋 Form data:", JSON.stringify(formData, null, 2));

    try {
      const response = await fetch("http://localhost:8000/saintpaulia/saintpaulias/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
      const data = await response.json();
      console.log("❌ Error response:", data);
      console.log("📝 Detailed error info:", JSON.stringify(data, null, 2));
      
      // Handle different error formats
      let errorMessage = "Помилка при створенні сорту.";

      if (data.detail) {
        if (Array.isArray(data.detail)) {
          // Handle validation errors (array format)
          errorMessage = data.detail
            .map(error => {
              if (typeof error === 'string') {
                return error;
              } else if (error.msg) {
                return `${error.loc ? error.loc.join('.') + ': ' : ''}${error.msg}`;
              }
              return JSON.stringify(error);
            })
            .join('; ');
        } else if (typeof data.detail === 'string') {
          // Handle simple string errors
          errorMessage = data.detail;
        }
      }
      
      throw new Error(errorMessage);
    }

    const newVariety = await response.json();
    navigate(`/variety/${encodeURIComponent(newVariety.name)}`);
  } catch (err) {
    console.error("💥 Submit error:", err);
    setError(err.message);
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Додати новий сорт</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Назва сорту:</label><br />
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Опис:</label><br />
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <label>Розмір розетки:</label><br />
          <input type="text" name="size_category" value={formData.size_category} onChange={handleChange} />
        </div>
        <div>
          <label>Колір квітів:</label><br />
          <input type="text" name="flower_color" value={formData.flower_color} onChange={handleChange} />
        </div>
        <div>
          <label>Розмір квітів:</label><br />
          <input type="text" name="flower_size" value={formData.flower_size} onChange={handleChange} />
        </div>
        <div>
          <label>Форма квітів:</label><br />
          <input type="text" name="flower_shape" value={formData.flower_shape} onChange={handleChange} />
        </div>
        <div>
          <label>Наповненість квітів:</label><br />
          <input type="text" name="flower_doubleness" value={formData.flower_doubleness} onChange={handleChange} />
        </div>
        <div>
          <label>Характеристики цвітіння:</label><br />
          <input type="text" name="blooming_features" value={formData.blooming_features} onChange={handleChange} />
        </div>
        <div>
          <label>Форма листків:</label><br />
          <input type="text" name="leaf_shape" value={formData.leaf_shape} onChange={handleChange} />
        </div>
        <div>
          <label>Строкатість листя:</label><br />
          <input type="text" name="leaf_variegation" value={formData.leaf_variegation} onChange={handleChange} />
        </div>
        <div>
          <label>Селекціонер:</label><br />
          <input type="text" name="selectionist" value={formData.selectionist} onChange={handleChange} />
        </div>
        <div>
          <label>Рік селекції:</label><br />
          <input type="text" name="selection_year" value={formData.selection_year} onChange={handleChange} />
        </div>
        <div>
          <label>Походження сорту:</label><br />
          <input type="text" name="origin" value={formData.origin} onChange={handleChange} />
        </div>
        <button type="submit">Зберегти</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}