import { useAuth } from "../context/AuthContext";

export function useCurrentUser() {
  const { user } = useAuth();
  return user; // user: { email, role, confirmed, accessToken } або null
}
