import React from "react";
import "./CSS/Home.css";
import { useNavigate } from "react-router-dom";
import g7 from "../Components/Assets/g7.PNG";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* HERO SECTION */}
      <div
        className="landing-top"
        style={{ backgroundImage: `url(${g7})` }}
      >
        <div className="top-overlay" />

        {/* LOGO */}
        <div className="logo">
          <span className="logo-box">SlavePort Archive</span>
        </div>

        {/* CENTER CONTENT */}
        <div className="hero-content">
          <h1>
            Slaveport revealing untold story <br />
            <span>of Global Slave Trade</span>
          </h1>

          <p>
            Explore key slave trade geographical ports across Europe, Africa,
            Americas & other regions. Discover their historical significance,
            timelines, and impact through an interactive global experience.
          </p>

          <div className="buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/globeview")}
            >
              Visit now →
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/adminlogin")}
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;