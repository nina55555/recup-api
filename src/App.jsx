import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Navbar from "./components/Navbar";

// Import de toutes tes pages
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Book from "./pages/Book";
import About from "./pages/About";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />

      {/* Le main englobe toutes les sections pour scroll vertical */}
      <main style={{
        scrollSnapType: "y mandatory",
        overflowY: "scroll",
        height: "100vh"
      }}>
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
    </QueryClientProvider>
  );
}

export default App;