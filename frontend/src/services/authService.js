import axios from "axios";

const API_URL = "http://localhost:8000";

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email); 
  formData.append("password", password);

  return axios.post(`${API_URL}/auth/login`, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}


import { jwtDecode } from "jwt-decode";

export function getUserFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return { email: decoded.sub };
  } catch (error) {
    console.error("Invalid token");
    return null;
  }
}


import api from "./api";

export async function requestConfirmationEmail(email) {
  const res = await api.post("/auth/request-email", { email });
  return res.data;
}


export async function getUserData() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Token not found");
  }

  const res = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data; // очікується, що бекенд повертає { email, confirmed }
}