import api from "./api";

// export const fetchFieldOptions = async () => {
//   const response = await api.get("/saintpaulia/saintpaulias/field-options");
//   return response.data;
// };

export const fetchFieldOptions = async () => {
  try {
    const res = await api.get("/saintpaulia/saintpaulias/field-options");
    console.log("🎯 Отримані опції для форми:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Не вдалося завантажити опції для полів:", error);
    throw error;
  }
};