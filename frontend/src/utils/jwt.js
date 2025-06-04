import { jwtDecode } from "jwt-decode";

export function parseJwt(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid JWT", error);
    return null;
  }
}
