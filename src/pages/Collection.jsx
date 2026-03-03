import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import "../css/Collection.css";

const Collection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [direction, setDirection] = useState("next");
  const [ticketVisible, setTicketVisible] = useState(false); // état ticket visible

  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  if (isLoading) return <div className="loader">Loading...</div>;
  if (isError) return <div className="loader">Erreur de chargement</div>;

  const images = data?.data || [];
  const total = images.length;

  const nextIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
  const nextNextIndex = nextIndex === total - 1 ? 0 : nextIndex + 1;
  const nextThirdIndex = nextNextIndex === total - 1 ? 0 : nextNextIndex + 1;

  // 🔥 déclenchement animation ticket
  const triggerTicketAnimation = () => {
    setTicketVisible(false); // reset animation
    setTimeout(() => setTicketVisible(true), 10); // relance animation
  };

  const nextSlide = () => {
    setDirection("next");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
    triggerTicketAnimation();
  };

  const prevSlide = () => {
    setDirection("prev");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
    triggerTicketAnimation();
  };

  // Slide actuellement active pour le ticket
  const activeSlide = images[currentIndex];

  return (
    <div
      className="slider-container"
      style={{
        backgroundImage: `url(${activeSlide?.imageUrl})`,
      }}
    >
      <div className="slider-3d">
        {images.map((item, index) => {
          let positionClass = "hiddenSlide";

          /* 🔥 LOGIQUE SUIVANT = INTACTE */
          if (direction === "next" && index === currentIndex) {
            positionClass = "activeExpandSlide";
          }

          /* 🔥 LOGIQUE PRECEDENT = ANCIENNE SLIDE QUI REVIENT */
          else if (direction === "prev" && index === previousIndex) {
            positionClass = "shrinkBackToCenter";
          }

          else if (index === nextIndex) {
            positionClass = "centerSlide";
          }

          else if (index === nextNextIndex) {
            positionClass = "rightSlide";
          }

          else if (index === nextThirdIndex) {
            positionClass = "rightFarTopSlide";
          }

          return (
            <div
              key={item._id}
              className={`slide ${positionClass}`}
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
          );
        })}
      </div>

      {/* Ticket dynamique */}
      <div className={`ticket ${ticketVisible ? "animateTicket" : ""}`}>
        <h1>{activeSlide?.title || "MODEL"}</h1>
        <span></span>
        <h2>{activeSlide?.description || "descr"}</h2>
        <span></span>
        <p>{activeSlide?.subtitle || "I want this piece"}</p>
      </div>

      <div className="buttons">
        <button onClick={prevSlide}>‹</button>
        <button onClick={nextSlide}>›</button>
      </div>
    </div>
  );
};

export default Collection;