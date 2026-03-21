import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";

const Enchere = ({ onBidSubmit, bids }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastBidIndex, setLastBidIndex] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");

  const listRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : MIN_BID;

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

  const openBook = (comment) => {
    setSelectedComment(comment || "Aucun commentaire");
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
        />
        <button onClick={handleSubmit}>OK</button>
      </div>

      {showError && <div className="error-popup">Enchère trop basse</div>}

      <div className="bid-list" ref={listRef}>
        {bids.map((bid, index) => (
          <div className="bid-infos" key={index}>
            <div className="bid-row">
              <div className="bid-row-left">
                <div className="pseudo">
                  <p>{bid.pseudo || "PSEUDO"}</p>
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
                  <p>{bid.amount}€</p>
                </div>

                <div className="icons-ench">
                  <a href="#">🔥</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); openBook(bid.message); }}>
                    📖
                  </a>
                </div>
              </div>
            </div>

            <div className="pays-promu">
              <p>PAYS PROMU: {bid.country || "-"}</p>
            </div>
          </div>
        ))}
      </div>

      {showBook && (
        <div className="book-overlay">
          <div className="book-popup">
            <span className="book-close" onClick={() => setShowBook(false)}>✕</span>
            <div className="book">
              <div className="page right">
                <p className="book-text">{selectedComment}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enchere;