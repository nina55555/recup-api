import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);

  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClicked = () => {
    setMenuOpen(false);
  };

  /* 🔥 BLOQUE SCROLL SI MENU OUVERT */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  return (
    <div className="mainBox-nav">
      <div className="lilNav-box0"></div>

      <div className="lilTitle-box1">
        <Link to="/" className="title">
          <img src="src/assets/logoseul.png" alt="logo" />
        </Link>
      </div>

      <div className="lilNav-box2">
        <ul className={menuOpen ? "open" : ""}>
          <li><NavLink to="/home" onClick={handleMenuClicked}>Home</NavLink></li>
          <li><NavLink to="collection" onClick={handleMenuClicked}>Collection</NavLink></li>
          <li><NavLink to="Conc" onClick={handleMenuClicked}>Le Concept</NavLink></li>
          <li><NavLink to="Signup" onClick={handleMenuClicked}>Book</NavLink></li>
          <li><NavLink to="Signup" onClick={handleMenuClicked}>About</NavLink></li>
          <li><NavLink to="Signup" onClick={handleMenuClicked}>Contact</NavLink></li>
        </ul>

        {/* 🔥 BURGER → CROIX */}
        <div
          className={`lilBurger-box3 ${menuOpen ? "active" : ""}`}
          onClick={handleMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}