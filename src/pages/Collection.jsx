import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { useQuery } from "react-query";
import "../css/Collection.css";
import Icons from "../components/Icons";
import "../css/Icons.css";

const Collection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [direction, setDirection] = useState("next");
  const [ticketVisible, setTicketVisible] = useState(false);

  // 🔥 FETCH DATA
  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  const images = data?.data || [];
  const total = images.length;

  // 🔥 CLICK → PAGE PRODUCT
  const handleClick = () => {
    if (activeSlide?._id) {
      window.location.href = `/product/${activeSlide._id}`;
    }
  };

  // 🔥 ACTIVE SLIDE
  const activeSlide = images[currentIndex];

  // 🔥 SHOW TICKET
  useEffect(() => {
    if (images.length > 0) setTicketVisible(true);
  }, [images]);

  // 🔥 AUTO SLIDE
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

  if (isLoading) return <div className="loader">Loading...</div>;
  if (isError) return <div className="loader">Erreur de chargement</div>;
  if (images.length === 0) return <div className="loader">Aucune image disponible</div>;

  const nextIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
  const nextNextIndex = nextIndex === total - 1 ? 0 : nextIndex + 1;
  const nextThirdIndex = nextNextIndex === total - 1 ? 0 : nextNextIndex + 1;

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
        style={{
          backgroundImage: `url(${activeSlide?.imageUrl})`,
        }}
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
                key={item._id}
                className={`slide ${positionClass}`}
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
            );
          })}
        </div>

        {/* 🔥 TICKET CLIQUABLE */}
        <div
          className={`ticket ${ticketVisible ? "animateTicket" : ""}`}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <h1>{activeSlide?.title || "MODEL"}</h1>
          <span></span>
          <h2>{activeSlide?.description || "descr"}</h2>
          <span></span>
          <p>{activeSlide?.subtitle || "I WANT THIS EXCLUSIVE PIECE"}</p>
        </div>

        {/* 🔥 BUTTONS */}
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