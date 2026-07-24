// Collection.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
/* ============================================================
   MEDIAS SUPABASE MOMENTANÉMENT INDISPONIBLES
   ============================================================
   L'import ci-dessous est commenté car les médias hébergés
   sur Supabase (images/vidéos) ne sont pas accessibles pour
   le moment. Décommente quand le stockage est de nouveau OK.
*/
// import { supabase } from "../lib/supabase"; // client Supabase
import { useNavigate } from "react-router-dom";
import "../css/Collection.css";
import Icons from "../components/Icons";
import "../css/Icons.css";

/*import Navbar from "../components/Navbar.jsx";*/

const AUTO_SLIDE_DELAY_MS = 30000; // 30 secondes avant le slide suivant

const Collection = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [direction, setDirection] = useState("next");
  const [ticketVisible, setTicketVisible] = useState(false);
  const [slideReady, setSlideReady] = useState(false);

  const navigate = useNavigate();
  const [loadError, setLoadError] = useState(null);
  const slideTimeoutRef = useRef(null);
  const isVisibleRef = useRef(true);

  // --- Fonction pour passer au slide suivant ---
  const goToNext = useCallback(() => {
    setDirection("next");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    setTicketVisible(false);
    setSlideReady(false);
    setTimeout(() => setTicketVisible(true), 10);
  }, [currentIndex, images.length]);

  // --- Planifier le prochain slide après délai ---
  const scheduleNext = useCallback(() => {
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
    if (!isVisibleRef.current) return; // onglet caché → ne pas planifier

    slideTimeoutRef.current = setTimeout(() => {
      goToNext();
    }, AUTO_SLIDE_DELAY_MS);
  }, [goToNext]);

  // --- Quand le média (vidéo ou image) est chargé et prêt ---
  const onMediaReady = useCallback(() => {
    setSlideReady(true);
  }, []);

  /* ============================================================
     MEDIAS SUPABASE MOMENTANÉMENT INDISPONIBLES
     ============================================================
     Le fetch des modèles depuis Supabase est commenté car
     les médias ne sont pas accessibles pour le moment.
  */
  /*
  useEffect(() => {
    async function fetchModels() {
      try {
        const { data, error } = await supabase
          .from("models")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur récupération modèles:", error);
          return;
        }

        if (!data || data.length === 0) {
          console.warn("Aucun modèle disponible");
          setImages([]);
          return;
        }

        setImages(data);
      } catch (err) {
        console.error("Erreur inattendue fetchModels:", err);
      }
    }
    fetchModels();
  }, []);
  */

  // Global error handlers to capture runtime errors and show a visible message
  useEffect(() => {
    const onError = (e) => {
      console.error('Global error caught', e);
      setLoadError(e?.message || (e?.error && e.error.message) || 'Unknown error');
    };

    const onRejection = (e) => {
      console.error('Unhandled rejection', e);
      setLoadError(e?.reason?.message || e?.reason || 'Unhandled rejection');
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  const total = images.length;

  // Déclenchement du ticket dès le chargement des images
  useEffect(() => {
    if (images.length > 0) setTicketVisible(true);
  }, [images]);

  // --- Auto-slide intelligent : démarre quand le média est prêt ---
  useEffect(() => {
    if (images.length === 0) return;

    if (slideReady) {
      scheduleNext();
    }

    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = null;
      }
    };
  }, [slideReady, currentIndex, images.length, scheduleNext]);

  // --- Page Visibility API : pause le timer si l'onglet est caché ---
  useEffect(() => {
    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
      if (document.hidden) {
        // Onglet caché → on annule le timer
        if (slideTimeoutRef.current) {
          clearTimeout(slideTimeoutRef.current);
          slideTimeoutRef.current = null;
        }
      } else {
        // Onglet visible à nouveau → on relance si le média est prêt
        if (slideReady) {
          scheduleNext();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [slideReady, scheduleNext]);

  const nextIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
  const nextNextIndex = nextIndex === total - 1 ? 0 : nextIndex + 1;
  const nextThirdIndex = nextNextIndex === total - 1 ? 0 : nextNextIndex + 1;

  const activeSlide = images[currentIndex];

  /* ============================================================
     MEDIAS SUPABASE MOMENTANÉMENT INDISPONIBLES
     ============================================================
     Le fetch des modèles depuis Supabase étant désactivé,
     images.length reste à 0, donc ce bloc s'affiche toujours.
  */
  if (images.length === 0) {
    return (
      <>
        {loadError ? (
          <div style={{padding:20, color:'#900', background:'#fff8f8'}}>
            <h2>Erreur chargement</h2>
            <pre style={{whiteSpace:'pre-wrap'}}>{String(loadError)}</pre>
            <p>Regarde la console pour plus de détails (F12).</p>
          </div>
        ) : (
          <div className="collection-loader">
            <div className="collection-loader-ring" />
            <p>MEDIAS SUPABASE MOMENTANÉMENT INDISPONIBLES</p>
          </div>
        )}
      </>
    );
  }

  const prevSlide = () => {
    // Annuler le timer en cours
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
    setDirection("prev");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === 0 ? total - 1 : prev - 1));
    setTicketVisible(false);
    setSlideReady(false);
    setTimeout(() => setTicketVisible(true), 10);
  };

  const nextSlide = () => {
    // Annuler le timer en cours
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
    setDirection("next");
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => (prev === total - 1 ? 0 : prev + 1));
    setTicketVisible(false);
    setSlideReady(false);
    setTimeout(() => setTicketVisible(true), 10);
  };

  return (
    <>
      <div
        className="slider-container"
        style={activeSlide?.video_url ? {} : { backgroundImage: `url(${activeSlide?.image_url})` }}
      >
        {activeSlide?.video_url ? (
          <video
            key={activeSlide.video_url}
            className="collection-bg-video"
            src={activeSlide.video_url}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onCanPlay={onMediaReady}
          />
        ) : (
          /* Image cachée pour détecter le chargement */
          <img
            key={activeSlide.image_url}
            src={activeSlide.image_url}
            alt=""
            onLoad={onMediaReady}
            style={{ display: "none" }}
          />
        )}
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
                key={item.id}
                className={`slide ${positionClass}`}
                style={{ backgroundImage: `url(${item.image_url})` }}
              />
            );
          })}
        </div>

        <div
          className={`ticket ${ticketVisible ? "animateTicket" : ""}`}
          onClick={() => navigate(`/product/${activeSlide?.id}`)}
          style={{ cursor: "pointer" }}
        >
          <h1>{activeSlide?.title || "MODEL"}</h1>
          <span></span>
          <h2>{activeSlide?.description || "descr"}</h2>
          <span></span>
          <p>{activeSlide?.subtitle || "I WANT THIS EXCLUSIVE PIECE"}</p>
        </div>

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

