import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
/*import videoShow from "../assets/vid-home2.mp4";*/



/*import videoShow from "../assets/new.mp4";*/
/*import videoShow from "../assets/newwhite.mp4";*/
/*import videoShow from "../assets/newblack.mp4";*/
import videoShow from "../assets/newtransp.mp4";


import Collectiontype from "../components/Collectiontype";
import Icons from "../components/Icons";
import "../css/Home.css";

const Home = () => {
  const [isTextboxOpen, setIsTextboxOpen] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoText, setVideoText] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const textboxRef = useRef(null);
  const btnRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const textSequence = [
      { text: "Aimer les défis", startMs: 300, durationMs: 5000 },
      { text: "Conquérir et impacter", startMs: 8000, durationMs: 7000 },
      { text: "Refuser les limites", startMs: 15000, durationMs: 5000 },
      { text: "Scaler", startMs: 20000, durationMs: 4000 },
      { text: "Attirer et satisfaire sa clientele", startMs: 27000, durationMs: 2000 },
      { text: "Accomplir", startMs: 30000, durationMs: 2000 },
      { text: "Engager la bonne energie", startMs: 33000, durationMs: 2000 },
    ];

    const getTextForTime = (timeMs) => {
      const entry = textSequence.find(
        ({ startMs, durationMs }) =>
          timeMs >= startMs && timeMs < startMs + durationMs
      );
      return entry ? entry.text : "";
    };

    const video = videoRef.current;
    if (!video || isTextboxOpen || !isVideoReady) {
      setVideoText("");
      return;
    }

    const updateText = () => {
      const currentMs = video.currentTime * 1000;
      const nextText = getTextForTime(currentMs);
      setVideoText((currentText) =>
        currentText === nextText ? currentText : nextText
      );
    };

    updateText();
    const intervalId = window.setInterval(updateText, 250);

    return () => {
      window.clearInterval(intervalId);
      setVideoText("");
    };
  }, [isTextboxOpen, isVideoReady]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isTextboxOpen) {
      video.pause();
      return;
    }

    if (!isVideoReady) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [isTextboxOpen, isVideoReady]);

  useEffect(() => {
    const textbox = textboxRef.current;
    const button = btnRef.current;
    if (!button) return;

    const update = () => {
      if (!textbox) {
        const parent = button.parentElement || document.body;
        const pw = parent.getBoundingClientRect().width;
        button.style.maxWidth = `${Math.max(0, pw * 0.8)}px`;
        return;
      }
      const inner = textbox.querySelector(".welcometextt") || textbox;
      const style = getComputedStyle(inner);
      const rect = inner.getBoundingClientRect();
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const available = Math.max(0, rect.width - paddingLeft - paddingRight - 24);
      button.style.maxWidth = `${available}px`;
    };

    update();
    const ro = textbox ? new ResizeObserver(update) : null;
    if (ro && textbox) ro.observe(textbox);
    window.addEventListener("resize", update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [isTextboxOpen]);

  return (
    <div className="containBox">
      <div className="mainBoxx-welcome">
        <h2 className="welcome-video-title">Vous l'avez fait !</h2>
        <div className={`welcome-video-bg ${isTextboxOpen ? "" : "video-full"}`}>
          <video
            ref={videoRef}
            src={videoShow}
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoReady(true)}
            onCanPlay={() => setIsVideoReady(true)}
          />
          <div className={`welcome-video-overlay ${videoText ? "visible" : ""}`}>
            <span>{videoText}</span>
          </div>
        <div className="sound-control">
          <button type="button" className="sound-toggle" onClick={toggleMute}>
            {isMuted ? "Activer le son" : "Désactiver le son"}
          </button>
        </div>

        </div>
        <div className={`marbreG ${isVideoReady ? "animate" : ""}`}>
          {/*<img src='src/assets/Capture-marbre2.PNG'></img>*/}
        </div>

        {isTextboxOpen && (
          <div className="textbox" ref={textboxRef}>
            <button
              type="button"
              className="welcome-close"
              aria-label="Fermer le popup"
              onClick={() => setIsTextboxOpen(false)}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
            <div className="welcometextt">
              <h2>WELCOME</h2>
              <br />
              <br />

              <p>
                Si vous etes arrive jusqu'a cette page, c'est sans doute parce que nous
                avons repere votre charisme et votre aura pour impacter le monde.
                <br />
                Entrons ensemble dans cette belle experience stylistique pour une aventure
                hors du commun.
                <br />
              </p>
              <br />
              <h1 className="sign">IT V</h1>
            </div>
            <Collectiontype />
          </div>
        )}

        <div className="welcome-cta">
          <button ref={btnRef} className="btn-decouvrezz btn-welcomezz welcome-discover-btn">
            <Link to="/Collection">Decouvrez la collection</Link>
          </button>
        </div>

        <div className={`marbreD ${isVideoReady ? "animate" : ""}`}>
          {/*<img src='src/assets/Capture marbre 2.PNG'></img>*/}
        </div>

      </div>

      <Icons />

    </div>
  );
};

export default Home;
