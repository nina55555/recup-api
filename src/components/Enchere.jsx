import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";
import livreImage from "../assets/blankbook.jpg";

const Enchere = ({ onBidSubmit, bids, initialBidValue = null }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastBidIndex, setLastBidIndex] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const listRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : MIN_BID;

  useEffect(() => {
    const preloadBook = new Image();
    preloadBook.fetchPriority = "high";
    preloadBook.decoding = "async";
    preloadBook.src = livreImage;

    const existing = document.querySelector(`link[data-book-preload="${livreImage}"]`);
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = livreImage;
      link.setAttribute("data-book-preload", livreImage);
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!selectedStory) return;

    if (selectedStory.storyImageUrl) {
      const preloadImage = new Image();
      preloadImage.decoding = "async";
      preloadImage.src = selectedStory.storyImageUrl;
    }

    if (selectedStory.storyVideoUrl) {
      const preloadVideo = document.createElement("video");
      preloadVideo.preload = "metadata";
      preloadVideo.src = selectedStory.storyVideoUrl;
    }
  }, [selectedStory]);

  useEffect(() => {
    if (bids.length > 0) {
      setLastBidIndex(0);
      setTimeout(() => setLastBidIndex(null), 2000);

      if (listRef.current) listRef.current.scrollTop = 0;
    }
  }, [bids]);

  useEffect(() => {
    if (Number.isFinite(Number(initialBidValue)) && Number(initialBidValue) > 0) {
      setValue(String(Number(initialBidValue)));
    }
  }, [initialBidValue]);

  const handleSubmit = () => {
    const numericValue = Number(value);
    if (numericValue <= lastBid) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }
    onBidSubmit(numericValue);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const openBook = (bid) => {
    const selected = {
      story: bid.story || "Aucune histoire",
      storyImageUrl: bid.storyImageUrl || "",
      storyVideoUrl: bid.storyVideoUrl || "",
      pseudo: bid.pseudo || "Anonyme",
      socialLinks: bid.socialLinks || {},
    };

    setSelectedStory(selected);
    setShowBook(true);
  };

  const socialEntries = selectedStory?.socialLinks
    ? Object.entries(selectedStory.socialLinks).filter(([, url]) => Boolean(url))
    : [];

  const formatSocialDisplay = (platform, url) => {
    try {
      const parsed = new URL(url);
      const rawPath = parsed.pathname.replace(/^\/+|\/+$/g, "");
      const handle = rawPath.split("/")[0];
      if (handle && !["share", "p", "reel", "reels", "in"].includes(handle.toLowerCase())) {
        return `@${handle}`;
      }
      return platform === "x" ? "@x" : `@${platform}`;
    } catch (_error) {
      const trimmed = String(url || "").trim();
      if (trimmed.startsWith("@")) return trimmed;
      if (!trimmed) return `@${platform}`;
      return `@${trimmed}`;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="enchere-container">
      <img
        src={livreImage}
        alt=""
        aria-hidden="true"
        className="book-image-preload"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div className="bid-input-box">
        <input
          type="number"
          placeholder="Entrez votre enchère ici ..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSubmit}> OK</button>
      </div>

      {showError && (
        <div className="error-popup">
          Allez un peu de nerf ! L'enchère doit être supérieure à la dernière.
        </div>
      )}

      <div className="bid-list" ref={listRef}>
        {bids.map((bid, index) => {
          const isNew = index === lastBidIndex;
          const isTopBid = index === 0; // 🔥 PLUS HAUTE ENCHERE

          return (
            <div className={`bid-infos ${isNew ? "new-bid" : ""}`} key={index}>
              <div className="bid-row">
                <div className="bid-row-left">
                  <div className="pseudo">
                    <p>{bid.pseudo || "Anonyme"}</p>
                  </div>

                  <div className="a-encheri">
                    <p>a encheri le:</p>
                  </div>

                  <div className="date">
                    <p>{formatDate(bid.date)}</p>
                  </div>

                  <div className="com">
                    <p>{bid.message || "..."}</p>
                  </div>
                </div>

                <div className="bid-row-right">
                  <div className="price">
                    <p>{bid.amount}EUR</p>
                  </div>

                  <div className="icons-ench">

                    {/* 🔥 FEU UNIQUEMENT SUR LA MEILLEURE ENCHERE */}
                    {isTopBid && (
                      <button title="Meilleure enchère">
                        🔥
                      </button>
                    )}

                    <button title="voir son histoire" onClick={() => openBook(bid)}>
                      📖
                    </button>

                  </div>
                </div>
              </div>

              <div className="pays-promu">
                <p>PAYS PROMU: {bid.country || "-"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showBook && (
        <div className="book-overlay">
          <div className="book-popup">
            <span className="book-close" onClick={() => setShowBook(false)}>
              ✕
            </span>

            <div className="book-visual">
              <img className="book-image" src={livreImage} alt="Livre ouvert" />

              <div className="book-layer book-layer-left">
                {selectedStory?.storyVideoUrl ? (
                  <video
                    autoPlay
                    muted
                    className="book-media"
                    src={selectedStory.storyVideoUrl}
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : selectedStory?.storyImageUrl ? (
                  <img
                    className="book-media"
                    src={selectedStory.storyImageUrl}
                    alt="Illustration de story"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                ) : (
                  <div className="book-media-empty">Aucun media ajoute</div>
                )}

                {socialEntries.length > 0 && (
                  <div className="book-social-links">
                    {socialEntries.map(([key, url]) => (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                        {formatSocialDisplay(key, url)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="book-layer book-layer-right">
                <div className="book-text-panel">
                  <p className="book-author">{selectedStory?.pseudo || "Anonyme"}</p>
                  <p className="book-text">
                    {selectedStory?.story || "Aucune histoire"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enchere;
