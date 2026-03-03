import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import "../css/Collection.css";

const Collection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const nextSlide = () =>
    setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));

  return (
    <div
      className="slider-container"
      style={{
        backgroundImage: `url(${images[nextIndex]?.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.8s ease"
      }}
    >
      <div className="slider-3d">
        {images.map((item, index) => {
          let positionClass = "hiddenSlide";

          if (index === currentIndex) {
            positionClass = "leftFadeSlide";
          } 
          else if (index === nextIndex) {
            positionClass = "centerSlide";
          } 
          else if (index === nextNextIndex) {
            positionClass = "rightTopSlide";
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