import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "../css/Slides.css";

export const Slides = ({ products }) => {
  
  return (

    <Swiper
      spaceBetween={10}
      slidesPerView={4}
      onSlideChange={() => console.log("slide change")}
      onSwiper={(swiper) => console.log(swiper)}
    >
      {products.map((img, i) => (
        <SwiperSlide key={i}>
          <img src={img.imageUrl} alt={img.title}  />
        </SwiperSlide>
      ))}
    </Swiper>
    
  );
};


export default Slides;

