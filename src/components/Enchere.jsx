import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";

const Enchere = ({ onBidSubmit, bids }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastBidIndex, setLastBidIndex] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const listRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid =
    bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : MIN_BID;

  useEffect(() => {
    if (bids.length > 0) {
      setLastBidIndex(0);
      setTimeout(() => setLastBidIndex(null), 2000);

      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
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

  // 📖 OUVRIR STORY
  const openBook = (bid) => {
    setSelectedStory({
      story: bid.story || "Aucune histoire",
      avatarUrl: bid.avatarUrl || "",
      storyImageUrl: bid.storyImageUrl || "",
      storyVideoUrl: bid.storyVideoUrl || "",
      pseudo: bid.pseudo || "Anonyme",
    });
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
        <button onClick={handleSubmit}>OK</button>
      </div>

      {showError && (
        <div className="error-popup">
          Allez un peu de nerf ! L'enchère doit être supérieure à la dernière.
        </div>
      )}

      <div className="bid-list" ref={listRef}>
        {bids.map((bid, index) => {
          const isNew = index === lastBidIndex;

          return (
            <div className={`bid-infos ${isNew ? "new-bid" : ""}`} key={index}>
              <div className="bid-row">
                <div className="bid-row-left">

                  {/* ✅ PSEUDO */}
                  <div className="pseudo">
                    <p>{bid.pseudo || "Anonyme"}</p>
                  </div>

                  <div className="a-encheri">
                    <p>a enchéri le:</p>
                  </div>

                  {/* ✅ DATE */}
                  <div className="date">
                    <p>{formatDate(bid.date)}</p>
                  </div>

                  {/* ✅ MESSAGE */}
                  <div className="com">
                    <p>{bid.message || "..."}</p>
                  </div>
                </div>

                <div className="bid-row-right">
                  <div className="price">
                    <p>{bid.amount}€</p>
                  </div>

                  <div className="icons-ench">
                    <a href="#">🔥</a>

                    {/* ✅ STORY */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openBook(bid);
                      }}
                    >
                      📖
                    </a>
                  </div>
                </div>
              </div>

              {/* ✅ COUNTRY */}
              <div className="pays-promu">
                <p>PAYS PROMU: {bid.country || "-"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📖 POPUP LIVRE */}
      {showBook && (
        <div className="book-overlay">
          <div className="book-popup">
            <span className="book-close" onClick={() => setShowBook(false)}>
              ✕
            </span>
            <div className="book">
              <div className="page left">
                {selectedStory?.avatarUrl && (
                  <img
                    className="book-avatar"
                    src={selectedStory.avatarUrl}
                    alt={`Profil de ${selectedStory?.pseudo || "utilisateur"}`}
                  />
                )}

                <div className="book-media-stack">
                  {selectedStory?.storyImageUrl && (
                    <img
                      className="book-media"
                      src={selectedStory.storyImageUrl}
                      alt="Illustration de story"
                    />
                  )}

                  {selectedStory?.storyVideoUrl && (
                    <video
                      className="book-media"
                      src={selectedStory.storyVideoUrl}
                      controls
                      playsInline
                    />
                  )}

                  {!selectedStory?.storyImageUrl && !selectedStory?.storyVideoUrl && (
                    <div className="book-media-empty">Aucun média ajouté</div>
                  )}
                </div>
              </div>
              <div className="page right">
                <div className="book-text-wrap">
                  <p className="book-author">{selectedStory?.pseudo || "Anonyme"}</p>
                  <p className="book-text">{selectedStory?.story || "Aucune histoire"}</p>
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
