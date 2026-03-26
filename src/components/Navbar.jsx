import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePseudo, setProfilePseudo] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";
  const isProductPage = location.pathname.startsWith("/product/");
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
    const syncUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser || null);
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadProfilePseudo = async () => {
      if (!user?.id) {
        setProfilePseudo("");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erreur chargement pseudo navbar :", error);
        setProfilePseudo("");
        return;
      }

      setProfilePseudo(data?.pseudo || "");
    };

    loadProfilePseudo();
  }, [user]);

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

  const goToProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-white/20 backdrop-blur-xl border-b border-white/20"
            : isLandingPage
              ? "bg-white"
              : "bg-white"
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
        <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between ${isProductPage ? "h-14" : "h-20"}`}>
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
            className={`absolute left-1/2 -translate-x-1/2 font-semibold ${isProductPage ? "text-xl" : "text-2xl"}`}
            style={{ zIndex: 1000001 }}
          >
            IT V
          </button>

          <div className="hidden md:flex ml-auto" style={{ position: "relative", zIndex: 1000001 }}>
            {user && profilePseudo && (
              <div className="mr-3 rounded-full border border-stone-200/80 bg-white/70 px-2.5 py-1 text-[9px] font-light tracking-[0.18em] text-stone-500 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm lg:mr-6 lg:px-4 lg:text-[11px] lg:tracking-[0.28em]">
                Hello "{profilePseudo}"
              </div>
            )}
            {user && (
              <button
                type="button"
                onClick={goToProfile}
                className="mr-6 text-[12px] uppercase tracking-wider text-gray-600 hover:text-black"
              >
                Profile
              </button>
            )}
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

            {user && profilePseudo && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-full border border-stone-200/80 bg-white/80 px-5 py-2 text-[11px] font-light tracking-[0.28em] text-stone-500 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm"
              >
                Hello "{profilePseudo}"
              </motion.div>
            )}

            {[...navLinks, ...(user ? [{ label: "Profile", id: "profile" }] : []), { label: "Contact", id: "contact" }].map((link, i) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => (link.id === "profile" ? goToProfile() : goToSection(link.id))}
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
