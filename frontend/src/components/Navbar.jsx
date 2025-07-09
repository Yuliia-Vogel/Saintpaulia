import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" style={styles.link}>
          🌸 Saintpaulia App
        </Link>
      </div>
      <div style={styles.buttons}>
        {user && ["expert", "breeder", "admin", "superadmin"].includes(user.role) && (
          <Link to="/add" style={styles.link}>
            + Створити новий сорт
          </Link>
        )}
        {user ? (
          <button onClick={handleLogout} style={styles.logoutButton}>
            Вийти
          </button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Увійти
            </Link>
            <Link to="/register" style={styles.link}>
              Реєстрація
            </Link>
            <Link to="/forgot-password" style={styles.link}>
              Забули пароль?
            </Link>
          </>
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
    alignItems: "center",
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
