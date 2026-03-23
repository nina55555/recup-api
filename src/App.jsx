import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import Navbar from "./components/Navbar";

// Pages
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Book from "./pages/Book";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";

const queryClient = new QueryClient();

function App() {
  const location = useLocation();

  // IntersectionObserver pour fade-in des sections
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Vérifie si on est sur une page "full route" (ex: /product/:id)
  const isFullRoute = location.pathname.startsWith("/product");

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />

      {isFullRoute ? (
        // Page complète sans scroll snap
        <Routes>
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      ) : (
        // Pages scrollables
        <main
          style={{
            scrollSnapType: "y mandatory",
            overflowY: "scroll",
            height: "100vh",
            scrollBehavior: "smooth",
          }}
        >
          <section id="welcome" style={{ minHeight: "100vh", scrollSnapAlign: "start" }}>
            <Welcome />
          </section>

          <section id="home" style={{ minHeight: "100vh", scrollSnapAlign: "start" }}>
            <Home />
          </section>

          <section id="collection" style={{ minHeight: "100vh", scrollSnapAlign: "start" }}>
            <Collection />
          </section>

          <section id="book" style={{ minHeight: "100vh", scrollSnapAlign: "start" }}>
            <Book />
          </section>

          <section id="about" style={{ minHeight: "100vh", scrollSnapAlign: "start" }}>
            <About />
          </section>

          <section id="contact" style={{ minHeight: "100vh", scrollSnapAlign: "start" }}>
            <Contact />
          </section>
        </main>
      )}
    </QueryClientProvider>
  );
}

export default App;