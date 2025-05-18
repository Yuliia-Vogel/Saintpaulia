import axios from "axios";

const api = axios.create({
  baseURL: "/api", // використовує проксі
});

export default api;
