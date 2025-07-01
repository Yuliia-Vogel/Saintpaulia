import api from "./api";

export const fetchFieldOptions = async () => {
  const response = await api.get("/field-options");
  return response.data;
};
