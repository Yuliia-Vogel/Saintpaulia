import { jwtDecode } from "jwt-decode";

export function parseJwt(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid JWT", error);
    return null;
  }
}

export function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp) {
      return true; // Якщо немає exp — вважаємо токен протермінованим
    }

    const now = Math.floor(Date.now() / 1000); // поточний час у секундах
    return decoded.exp < now;
  } catch (error) {
    console.error("Помилка перевірки токена на протермінування:", error);
    return true;
  }
}
