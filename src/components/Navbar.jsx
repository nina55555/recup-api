import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";
  const getSectionOffset = (id) => {
    if (id === "book") return 0;
    if (id === "home") return 0;
    if (id === "collection") return 0;
    if (id === "about") return 0;
    if (id === "contact") return 0;
    return 80;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Collection", id: "collection" },
    { label: "Book", id: "book" },
    { label: "About", id: "about" },
  ];

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (!element) return false;

    const scroller = document.scrollingElement || document.documentElement;
    const offset = getSectionOffset(id);
    const targetTop = Math.max(
      0,
      element.getBoundingClientRect().top + scroller.scrollTop - offset
    );

    scroller.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    return true;
  };

  const goToSection = (id) => {
    setMenuOpen(false);

    if (location.pathname === "/") {
      window.history.replaceState(window.history.state, "", `/#${id}`);

      const runScroll = () => scrollToId(id);

      if (menuOpen) {
        window.setTimeout(runScroll, 250);
      } else {
        window.requestAnimationFrame(() => {
          runScroll();
        });
      }

      return;
    }

    navigate(`/#${id}`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-white/20 backdrop-blur-xl border-b border-white/20"
            : isLandingPage
              ? "bg-white"
              : "bg-transparent"
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000000,
          pointerEvents: "auto",
          isolation: "isolate",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="hidden md:flex gap-8" style={{ position: "relative", zIndex: 1000001 }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => goToSection(link.id)}
                className="text-[12px] uppercase tracking-wider text-gray-600 hover:text-black transition"
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToSection("home")}
            className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold"
            style={{ zIndex: 1000001 }}
          >
            IT V
          </button>

          <div className="hidden md:flex ml-auto" style={{ position: "relative", zIndex: 1000001 }}>
            <button
              type="button"
              onClick={() => goToSection("contact")}
              className="text-[12px] uppercase tracking-wider text-gray-600 hover:text-black"
            >
              Contact
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden ml-auto"
            style={{ position: "relative", zIndex: 1000003 }}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-10 z-40"
            style={{ zIndex: 1000002 }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="md:hidden absolute top-[18px] right-3 h-12 w-12 rounded-full border border-black/10 bg-white/90 text-stone-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition hover:scale-105 hover:bg-stone-100"
            >
              <span className="flex items-center justify-center">
                <X size={20} strokeWidth={1.75} />
              </span>
            </button>

            {[...navLinks, { label: "Contact", id: "contact" }].map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => goToSection(link.id)}
                  className="text-2xl uppercase tracking-widest"
                >
                  {link.label}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
