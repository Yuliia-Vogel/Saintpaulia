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

