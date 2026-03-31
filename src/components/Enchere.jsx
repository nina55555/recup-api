import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";
import livreImage from "../assets/blankbook.jpg";

const Enchere = ({ onBidSubmit, bids }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastBidIndex, setLastBidIndex] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const listRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : MIN_BID;

  useEffect(() => {
    if (bids.length > 0) {
      setLastBidIndex(0);
      setTimeout(() => setLastBidIndex(null), 2000);

      if (listRef.current) listRef.current.scrollTop = 0;
    }
  }, [bids]);

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="enchere-container">
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
                  />
                ) : selectedStory?.storyImageUrl ? (
                  <img
                    className="book-media"
                    src={selectedStory.storyImageUrl}
                    alt="Illustration de story"
                  />
                ) : (
                  <div className="book-media-empty">Aucun media ajoute</div>
                )}

                {selectedStory?.socialLinks &&
                  Object.entries(selectedStory.socialLinks).map(
                    ([key, url]) =>
                      url && (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </a>
                      )
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
