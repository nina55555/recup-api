import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, animate } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", path: "home" },
    { label: "Collection", path: "collection" },
    { label: "Book", path: "book" },
    { label: "About", path: "about" },
  ];

  // Scroll premium avec framer-motion
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      const target = section.offsetTop;
      animate(window.scrollY, target, {
        duration: 1.2,
        ease: [0.77, 0, 0.175, 1],
        onUpdate(value) {
          window.scrollTo(0, value);
        },
      });
    }
    setMenuOpen(false);
  };

  // Bloque scroll si menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled ? "bg-white/90 backdrop-blur-md border-b" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          {/* LEFT LINKS */}
          <div className="hidden md:flex gap-10">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => scrollToSection(link.path)}
                className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* LOGO / IT V */}
          <button
            onClick={() => scrollToSection("welcome")}
            className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold"
          >
            IT V
          </button>

          {/* RIGHT LINK */}
          <div className="hidden md:flex ml-auto">
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm uppercase tracking-wider text-gray-600 hover:text-black"
            >
              Contact
            </button>
          </div>

          {/* BURGER MOBILE */}
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
            {[...navLinks, { label: "Contact", path: "contact" }].map(
              (link, i) => (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => scrollToSection(link.path)}
                  className="text-2xl uppercase tracking-widest"
                >
                  {link.label}
                </motion.button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}