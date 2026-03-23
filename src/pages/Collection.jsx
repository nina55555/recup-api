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

  const { data, isLoading, isError } = useQuery("model", () =>
    axios.get("http://localhost:5978/defilons/")
  );

  const images = data?.data || [];
  const total = images.length;

  const activeSlide = images[currentIndex];

  const handleClick = () => {
    if (activeSlide?._id) {
      window.location.href = `/product/${activeSlide._id}`;
    }
  };

  useEffect(() => {
    if (images.length > 0) setTicketVisible(true);
  }, [images]);

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
  if (isError) return <div className="loader">Erreur</div>;
  if (images.length === 0) return <div className="loader">Aucune image</div>;

  return (
    <>
      <div
        className="slider-container"
        style={{
          backgroundImage: `url(${activeSlide?.imageUrl})`,
        }}
      >
        <div className="slider-3d">
          {images.map((item, index) => (
            <div
              key={item._id}
              className="slide"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
          ))}
        </div>

        <div
          className={`ticket ${ticketVisible ? "animateTicket" : ""}`}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <h1>{activeSlide?.title}</h1>
          <h2>{activeSlide?.description}</h2>
          <p>{activeSlide?.subtitle}</p>
        </div>
      </div>

      <Icons />
    </>
  );
};

export default Collection;