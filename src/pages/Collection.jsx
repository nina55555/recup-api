// Collection.jsx
import React, { useState, useEffect } from "react"; 
import { supabase } from "../lib/supabase"; // client Supabase
import { useNavigate } from "react-router-dom";
import "../css/Collection.css";
import Icons from "../components/Icons";
import "../css/Icons.css";

/*import Navbar from "../components/Navbar.jsx";*/

const Collection = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [direction, setDirection] = useState("next");
  const [ticketVisible, setTicketVisible] = useState(false);

  const navigate = useNavigate();

  // --- 1️⃣ Récupérer les modèles directement depuis Supabase ---
  useEffect(() => {
    async function fetchModels() {
      try {
        const { data, error } = await supabase
          .from("models")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur récupération modèles:", error);
          return;
        }

        if (!data || data.length === 0) {
          console.warn("Aucun modèle disponible");
          setImages([]);
          return;
        }

        // Si tu avais besoin de transformer des URLs via getPublicUrl, c’est ici
        // data.forEach(m => m.image_url = supabase.storage.from("profile-media").getPublicUrl(m.image_url).data.publicUrl)

        setImages(data);
      } catch (err) {
        console.error("Erreur inattendue fetchModels:", err);
      }
    }
    fetchModels();
  }, []);

  const total = images.length;

  // Déclenchement du ticket dès le chargement des images
  useEffect(() => {
    if (images.length > 0) setTicketVisible(true);
  }, [images]);

  // Slide automatique toutes les 5 secondes
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setDirection("next");
      setPreviousIndex(currentIndex);
      setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
      setTicketVisible(false);
      setTimeout(() => setTicketVisible(true), 10);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, images, total]);

  if (images.length === 0) return <div className="loader">Aucune image disponible</div>;

  const nextIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
  const nextNextIndex = nextIndex === total - 1 ? 0 : nextIndex + 1;
  const nextThirdIndex = nextNextIndex === total - 1 ? 0 : nextNextIndex + 1;

  const activeSlide = images[currentIndex];

  const prevSlide = () => {
    setDirection("prev");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
    setTicketVisible(false);
    setTimeout(() => setTicketVisible(true), 10);
  };

  const nextSlide = () => {
    setDirection("next");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
    setTicketVisible(false);
    setTimeout(() => setTicketVisible(true), 10);
  };

  return (
    <>
      <div
        className="slider-container"
        style={{ backgroundImage: `url(${activeSlide?.image_url})` }}
      >
        <div className="slider-3d">
          {images.map((item, index) => {
            let positionClass = "hiddenSlide";

            if (index === nextIndex && direction === "next") positionClass = "preActiveSlide";
            if (direction === "next" && index === currentIndex) positionClass = "activeExpandSlide";
            else if (direction === "prev" && index === previousIndex) positionClass = "shrinkBackToCenter";
            else if (index === nextIndex) positionClass = "centerSlide";
            else if (index === nextNextIndex) positionClass = "rightSlide";
            else if (index === nextThirdIndex) positionClass = "rightFarTopSlide";

            return (
              <div
                key={item.id}
                className={`slide ${positionClass}`}
                style={{ backgroundImage: `url(${item.image_url})` }}
              />
            );
          })}
        </div>

        <div
          className={`ticket ${ticketVisible ? "animateTicket" : ""}`}
          onClick={() => navigate(`/product/${activeSlide?.id}`)}
          style={{ cursor: "pointer" }}
        >
          <h1>{activeSlide?.title || "MODEL"}</h1>
          <span></span>
          <h2>{activeSlide?.description || "descr"}</h2>
          <span></span>
          <p>{activeSlide?.subtitle || "I WANT THIS EXCLUSIVE PIECE"}</p>
        </div>

        <div className="buttons">
          <button onClick={prevSlide}>‹</button>
          <button onClick={nextSlide}>›</button>
        </div>
      </div>
      <Icons />
    </>
  );
};

export default Collection;