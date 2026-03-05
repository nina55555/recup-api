import React from "react";
import videoShow from "../assets/vid-home2.mp4";
import "../css/Video.css";

function Video() {
  return (
    <div className="boxVideo">
      <p className="video-text">
        Vous l'avez fait !
      </p>
      <div className="videoShow">
        <video src={videoShow} autoPlay muted loop playsInline />
      </div>
    </div>
  );
}

export default Video;