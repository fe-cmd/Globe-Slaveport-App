import React, { useState } from "react";
import "./CSS/Adminlogin.css";
import { useNavigate } from "react-router-dom";
import g6 from "../Components/Assets/g6.PNG";

function AdminLogin() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "h@99yP03tr3y!na11") {
      navigate("/admindashboard-backend");
    } else {
      alert("Invalid password");
    }
  };

  return (
    <div
      className="admin-page"
      style={{ backgroundImage: `url(${g6})` }}
    >
      {/* Overlay */}
      <div className="admin-overlay" />

      {/* Back Button */}
      <button className="back-home-btn1" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      {/* Login Form */}
      <div className="login-box">
        <h2>Admin Login</h2>

        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} className="login-btn">
          Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;