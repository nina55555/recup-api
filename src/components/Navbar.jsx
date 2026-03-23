import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isProductPage = location.pathname.startsWith("/product");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (isProductPage) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Collection", id: "collection" },
    { label: "Book", id: "book" },
    { label: "About", id: "about" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled ? "bg-white/90 backdrop-blur-md border-b" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          
          {/* LEFT */}
          <div className="hidden md:flex gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm uppercase tracking-wider text-gray-600 hover:text-black"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* LOGO CENTER */}
          <button
            onClick={() => scrollToSection("welcome")}
            className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold"
          >
            IT V
          </button>

          {/* RIGHT */}
          <div className="hidden md:flex ml-auto">
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm uppercase text-gray-600 hover:text-black"
            >
              Contact
            </button>
          </div>

          {/* BURGER */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-auto">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-10 z-40"
          >
            {[...navLinks, { label: "Contact", id: "contact" }].map((link, i) => (
              <motion.button
                key={link.id}
                onClick={() => {
                  scrollToSection(link.id);
                  setMenuOpen(false);
                }}
                className="text-2xl uppercase"
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}