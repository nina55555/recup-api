import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes, useLocation } from "react-router-dom";
import "./css/App.css";

import Welcome from "./pages/Welcome";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Book from "./pages/Book";
import Collection from "./pages/Collection";
import CollectionAtest from "./pages/CollectionAtest";
import CollectionAtest2 from "./pages/CollectionAtest2";
import CollectionShow from "./pages/CollectionShow";
import Conc from "./pages/Conc";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";

const queryClient = new QueryClient();

function LandingPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <section id="welcome" style={{ minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
        <Welcome />
      </section>

      <section id="home" style={{ minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
        <Home />
      </section>

      <section id="collection" style={{ minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
        <Collection />
      </section>

      <section id="book" style={{ minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
        <Book />
      </section>

      <section id="about" style={{ minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
        <About />
      </section>

      <section id="contact" style={{ minHeight: "100vh", position: "relative", width: "100%", overflowX: "hidden" }}>
        <Contact />
      </section>
    </main>
  );
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const targetId = location.hash.replace("#", "");
    const NAVBAR_OFFSET = 80;

    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(targetId);

      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/collectionAtest" element={<CollectionAtest />} />
        <Route path="/collectionAtest2" element={<CollectionAtest2 />} />
        <Route path="/collectionShow" element={<CollectionShow />} />
        <Route path="/book" element={<Book />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/conc" element={<Conc />} />
        <Route path="/product/:id" element={<Product />} />
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
