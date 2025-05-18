import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Необов'язковий запит до бекенду, якщо треба (можна й без нього)
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      logoutUser(); // Очистити user і токени
      navigate("/"); // Повернутись на головну
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" style={styles.link}>🌸 Saintpaulia App</Link>
      </div>
      <div style={styles.buttons}>
        {!user ? (
          <>
            <Link to="/login" style={styles.link}>Увійти</Link>
            <Link to="/register" style={styles.link}>Реєстрація</Link>
            <Link to="/forgot-password" style={styles.link}>Забули пароль?</Link>
          </>
        ) : (
          <button onClick={handleLogout} style={styles.logoutButton}>Вийти</button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem",
    background: "#e0d4f7",
  },
  buttons: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#4a0072",
    fontWeight: "bold",
  },
  logoutButton: {
    background: "transparent",
    border: "none",
    color: "#4a0072",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default Navbar;
