import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: email.trim(),
        password: password.trim()
      });

      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user._id);

      if (data.user.role === "advisor") navigate("/advisor");
      else if (data.user.role === "technician") navigate("/technician");
      else if (data.user.role === "cashier") navigate("/cashier");
      else if (data.user.role === "manager") navigate("/manager");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-circle circle-1"></div>
        <div className="gradient-circle circle-2"></div>
        <div className="gradient-circle circle-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🚗</span>
            <h1>Vehicle Service Center</h1>
          </div>
          <p className="tagline">Professional Workshop Management System</p>
        </div>

        <form onSubmit={login} className="login-form">
          <h2>Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue to your dashboard</p>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="roles-info">
          <h3>Available Roles</h3>
          <div className="roles-grid">
            <div className="role-badge advisor">
              <span className="role-icon">🎯</span>
              <span>Service Advisor</span>
            </div>
            <div className="role-badge technician">
              <span className="role-icon">🔧</span>
              <span>Technician</span>
            </div>
            <div className="role-badge cashier">
              <span className="role-icon">💰</span>
              <span>Cashier</span>
            </div>
            <div className="role-badge manager">
              <span className="role-icon">📊</span>
              <span>Manager</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
