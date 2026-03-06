import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import "../css/Collection.css";

const Collection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [ticketVisible, setTicketVisible] = useState(false);

  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  if (isLoading) return <div className="loader">Loading...</div>;
  if (isError) return <div className="loader">Erreur de chargement</div>;

  const images = data?.data || [];
  const total = images.length;

  const triggerTicketAnimation = () => {
    setTicketVisible(false);
    setTimeout(() => setTicketVisible(true), 10);
  };

  const nextSlide = () => {
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % total);
    triggerTicketAnimation();
  };

  const prevSlide = () => {
    setDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    triggerTicketAnimation();
  };

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
          let position = (index - currentIndex + total) % total;

          let positionClass = "hiddenSlide";

          if (position === 0) positionClass = "centerSlide";
          else if (position === 1) positionClass = "rightSlide";
          else if (position === 2) positionClass = "rightFarTopSlide";

          return (
            <div
              key={item._id}
              className={`slide ${positionClass}`}
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
          );
        })}
      </div>

      <div
        className={`ticket ${ticketVisible ? "animateTicket" : ""}`}
        onClick={() => navigate(`/product/${activeSlide?._id}`)}
        style={{ cursor: "pointer" }}
      >
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