import React, { useState, useEffect, useRef } from "react";

const EncherePremium = ({ bids, onBidSubmit }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const bidsEndRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0
    ? Math.max(...bids.map(b => b.amount))
    : MIN_BID;

  // Scroll automatique vers le bas pour voir la dernière enchère
  useEffect(() => {
    if (bidsEndRef.current) {
      bidsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [bids]);

  const handleSubmit = () => {
    const numericValue = Number(value);
    if (!numericValue || numericValue <= lastBid) {
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

  return (
    <div className="enchere-premium-container">
      <div className="bid-input-box-premium">
        <input
          type="number"
          placeholder={`Votre enchère > ${lastBid}€`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSubmit}>OK</button>
      </div>

      {showError && (
        <div className="error-popup-premium">
          L'enchère doit être supérieure à la dernière !
        </div>
      )}

      <div className="bid-list-premium">
        {bids.map((bid, index) => {
          const date = new Date(bid.date).toLocaleString();
          return (
            <div
              key={index}
              className={`bid-card new-bid-premium`}
            >
              <div className="bid-info-left">
                <p className="pseudo">{bid.pseudo || "Anonyme"}</p>
                {bid.message && <p className="message">{bid.message}</p>}
                {bid.country && <p className="country">{bid.country}</p>}
              </div>
              <div className="bid-info-right">
                <p className="date">{date}</p>
                <p className="price">{bid.amount}€</p>
              </div>
            </div>
          );
        })}
        {/* Element pour scroll automatique vers le bas */}
        <div ref={bidsEndRef}></div>
      </div>
    </div>
  );
};

export default EncherePremium;