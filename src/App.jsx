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

  const isProductPage = location.pathname.startsWith("/product");

  useEffect(() => {
    if (isProductPage) return;

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
  }, [isProductPage]);

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />

      {/* 👉 ROUTES */}
      <Routes>
        <Route path="/product/:id" element={<Product />} />
      </Routes>

      {/* 👉 SI ON EST SUR PRODUCT → ON CACHE LE SCROLL */}
      {!isProductPage && (
        <main
          style={{
            scrollSnapType: "y mandatory",
            overflowY: "scroll",
            height: "100vh",
            scrollBehavior: "smooth",
          }}
        >
          <section id="welcome" style={{ minHeight: "100vh" }}>
            <Welcome />
          </section>

          <section id="home" style={{ minHeight: "100vh" }}>
            <Home />
          </section>

          <section id="collection" style={{ minHeight: "100vh" }}>
            <Collection />
          </section>

          <section id="book" style={{ minHeight: "100vh" }}>
            <Book />
          </section>

          <section id="about" style={{ minHeight: "100vh" }}>
            <About />
          </section>

          <section id="contact" style={{ minHeight: "100vh" }}>
            <Contact />
          </section>
        </main>
      )}
    </QueryClientProvider>
  );
}

export default App;