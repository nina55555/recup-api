import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Navbar from "./components/Navbar";

// Pages
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Book from "./pages/Book";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Style global
import "./css/App.css";

const queryClient = new QueryClient();

function App() {
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

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />

      {/* MAIN avec scroll vertical et smooth */}
      <main>
        <section id="welcome" className="section">
          <Welcome />
        </section>
        <section id="home" className="section">
          <Home />
        </section>
        <section id="collection" className="section">
          <Collection />
        </section>
        <section id="book" className="section">
          <Book />
        </section>
        <section id="about" className="section">
          <About />
        </section>
        <section id="contact" className="section">
          <Contact />
        </section>
      </main>
    </QueryClientProvider>
  );
}

export default App;