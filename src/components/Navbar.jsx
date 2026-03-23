

/*
import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
*/

/*import "../css/Navbar.css";*//*a remettre si ne fonctionne pas bien sans*/

/*
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);

  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClicked = () => {
    setMenuOpen(false);
  };

  */
  /* 🔥 BLOQUE SCROLL SI MENU OUVERT */
  
  /*useEffect(() => {
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
        */

        /*{ 🔥 BURGER → CROIX }*/

        /*<div
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

*/



/*fin 1ere code sans base 44 (rien etait en commentaires sauf les phrases de commentaires)*/











/* debut code base44 (retravaillé avc gpt) */


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 TES VRAIES ROUTES
  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Collection", path: "/collection" },
    { label: "Book", path: "/signup" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

          {/* LEFT LINKS (desktop) */}
          <div className="hidden md:flex gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 🔥 LOGO → WELCOME */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold"
          >
            IT V
          </Link>

          {/* RIGHT */}
          <div className="hidden md:flex ml-auto">
            <Link
              to="/contact"
              className="text-sm uppercase tracking-wider text-gray-600 hover:text-black"
            >
              Contact
            </Link>
          </div>

          {/* BURGER */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-auto"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-10 z-40"
          >
            {[
              ...navLinks,
              { label: "Contact", path: "/contact" }
            ].map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl uppercase tracking-widest"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}