import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const getRoleIcon = () => {
    switch (role) {
      case "advisor": return "🎯";
      case "technician": return "🔧";
      case "cashier": return "💰";
      case "manager": return "📊";
      default: return "👤";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "advisor": return "#f5576c";
      case "technician": return "#00f2fe";
      case "cashier": return "#764ba2";
      case "manager": return "#fee140";
      default: return "#3498db";
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🚗</span>
        <h3>Vehicle Service Center</h3>
      </div>

      <div className="navbar-right">
        <NotificationBell />
        <div className="role-badge" style={{ background: getRoleColor() }}>
          <span className="role-icon">{getRoleIcon()}</span>
          <span className="role-text">{role}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
