import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import "../css/Collection.css";

const Collection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch API
  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  if (isLoading) return <div className="loader">Loading...</div>;
  if (isError) return <div className="loader">Erreur de chargement</div>;

  const images = data?.data || [];

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="slider-container">
      <div className="slider-3d">
        {images.map((item, index) => {
          let position = "nextSlide";

          if (index === currentIndex) {
            position = "activeSlide";
          } else if (
            index === currentIndex - 1 ||
            (currentIndex === 0 && index === images.length - 1)
          ) {
            position = "lastSlide";
          }

          return (
            <div
              key={item._id}
              className={`slide ${position}`}
              style={{
                backgroundImage: `url(${item.imageUrl})`,
              }}
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