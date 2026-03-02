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

  const nextSlide = () =>
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <div
      className="slider-container"
      style={{
        backgroundImage: `url(${images[currentIndex]?.imageUrl})`,
        transition: "background-image 0.8s ease"
      }}
    >
      <div className="slider-3d">
        {images.map((item, index) => {
          const distance = (index - currentIndex + images.length) % images.length;

          let className = "hiddenSlide";
          if (distance === 0) className = "activeSlide";
          else if (distance === 1) className = "nextSlide";
          else if (distance === 2) className = "nextSlide2";
          else if (distance === 3) className = "nextSlide3";

          return (
            <div
              key={item._id}
              className={`slide ${className}`}
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