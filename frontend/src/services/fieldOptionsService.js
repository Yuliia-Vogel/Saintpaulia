import api from "./api";

let cachedFieldOptions = null;

// Отримати всі доступні опції для полів
export const fetchFieldOptions = async () => {
  if (cachedFieldOptions) {
    console.log("💾 Повертаємо кешовані опції для полів");
    return cachedFieldOptions;
  }

  try {
    const res = await api.get("/saintpaulia/saintpaulias/field-options");
    console.log("🎯 Отримані опції для форми:", res.data);
    cachedFieldOptions = res.data;
    return res.data;
  } catch (error) {
    console.error("❌ Не вдалося завантажити опції для полів:", error);
    throw error;
  }
};

// Отримати список усіх назв сортів
export const fetchVarietiesNames = async () => {
  try {
    const res = await api.get("/saintpaulia/saintpaulias/get_varieties_names");
    console.log("🌸 Отримані назви сортів:", res.data);
    return res.data.items;
  } catch (error) {
    console.error("❌ Не вдалося завантажити назви сортів:", error);
    throw error;
  }
};

// Перевірити унікальність назви сорту
export const checkNameUnique = async (name) => {
  try {
    const res = await api.get("/saintpaulia/saintpaulias/name_unique", {
      params: { name },
    });
    console.log(`🧐 Унікальність назви "${name}":`, res.data);
    return res.data.is_unique;
  } catch (error) {
    console.error("❌ Помилка при перевірці унікальності назви:", error);
    throw error;
  }
};
