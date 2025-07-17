// src/pages/AddVariety.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { VarietyForm } from "../components/VarietyForm";

export default function AddVariety() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setError("");

    try {
      const response = await api.post("/saintpaulia/", formData);
      const newVariety = response.data;
      navigate(`/variety/${encodeURIComponent(newVariety.name)}`);
    } catch (err) {
      console.error("💥 Submit error:", err);

      let errorMessage = "Помилка при створенні сорту.";

      const data = err.response?.data;
      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((error) => {
              if (typeof error === "string") return error;
              else if (error.msg) return `${error.loc ? error.loc.join(".") + ": " : ""}${error.msg}`;
              return JSON.stringify(error);
            })
            .join("; ");
        } else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        }
      }

      setError(errorMessage);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Додати новий сорт</h1>
      <VarietyForm onSubmit={handleSubmit} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
