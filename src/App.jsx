import React, { useLayoutEffect, useState, useRef, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes, useLocation } from "react-router-dom";
import "./css/App.css";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Book from "./pages/Book";
import Collection from "./pages/Collection";
import CollectionShow from "./pages/CollectionShow";
import Conc from "./pages/Conc";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Cgv from "./pages/Cgv";

const queryClient = new QueryClient();

function getSectionOffset(id) {
  if (id === "book") return 0;
  if (id === "home") return 0;
  if (id === "collection") return 0;
  if (id === "about") return 0;
  if (id === "contact") return 0;
  return 80;
}

function scrollToSectionId(id) {
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
}

// --- Composant section lazy avec IntersectionObserver ---
function LazySection({ id, children, style }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // ne plus observer une fois chargé
        }
      },
      { rootMargin: "200px" } // commence à charger 200px avant d'arriver
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} ref={ref} style={style}>
      {visible ? children : <div style={{ minHeight: "100vh" }} />}
    </section>
  );
}

function LandingPage() {
  const sectionStyle = {
    minHeight: "100vh",
    position: "relative",
    width: "100%",
    overflowX: "hidden",
  };

  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <section id="home" style={sectionStyle}>
        <Home />
      </section>

      <LazySection id="collection" style={sectionStyle}>
        <Collection />
      </LazySection>

      <LazySection id="book" style={sectionStyle}>
        <Book />
      </LazySection>

      <LazySection id="about" style={sectionStyle}>
        <About />
      </LazySection>

      <LazySection id="contact" style={sectionStyle}>
        <Contact />
      </LazySection>
    </main>
  );
}

function AppContent() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const targetId = location.hash.replace("#", "");

    let isCancelled = false;
    let timeoutId;
    let attempts = 0;

    const tryScroll = () => {
      if (isCancelled) return;

      attempts += 1;
      const didScroll = scrollToSectionId(targetId);

      if (!didScroll && attempts < 20) {
        timeoutId = window.setTimeout(tryScroll, 80);
      }
    };

    timeoutId = window.setTimeout(tryScroll, 80);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.hash]);

  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/cgv" element={<Cgv />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/collectionShow" element={<CollectionShow />} />
        <Route path="/book" element={<Book />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/conc" element={<Conc />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

