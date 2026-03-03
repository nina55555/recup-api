import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import "../css/Collection.css";

const Collection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("next"); // 🔥 direction animation

  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  if (isLoading) return <div className="loader">Loading...</div>;
  if (isError) return <div className="loader">Erreur de chargement</div>;

  const images = data?.data || [];
  const total = images.length;

  const nextIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
  const nextNextIndex =
    nextIndex === total - 1 ? 0 : nextIndex + 1;
  const nextThirdIndex =
    nextNextIndex === total - 1 ? 0 : nextNextIndex + 1;

  const prevIndex = currentIndex === 0 ? total - 1 : currentIndex - 1;

  const nextSlide = () => {
    setDirection("next");
    setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection("prev");
    setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
  };

  return (
    <div
      className="slider-container"
      style={{
        backgroundImage: `url(${images[currentIndex]?.imageUrl})`,
      }}
    >
      <div className="slider-3d">
        {images.map((item, index) => {
          let positionClass = "hiddenSlide";

          // 🔥 SLIDE ACTIVE
          if (index === currentIndex) {
            positionClass =
              direction === "next"
                ? "activeExpandSlide"
                : "activeShrinkFromBg";
          }

          // slide qui devient centre
          else if (index === nextIndex && direction === "next") {
            positionClass = "centerSlide";
          }

          else if (index === prevIndex && direction === "prev") {
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

      <div className="buttons">
        <button onClick={prevSlide}>‹</button>
        <button onClick={nextSlide}>›</button>
      </div>
    </div>
  );
};

export default Collection;