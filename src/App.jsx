import React, { useLayoutEffect } from "react";
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
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";

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

function LandingPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
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
        <Route path="/collection" element={<Collection />} />
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
