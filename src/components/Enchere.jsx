import React, { useState } from "react";

const Enchere = ({ onBidSubmit, bids }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : MIN_BID;

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

  const handleIconClick = (type, bid) => {
    alert(`Vous avez cliqué sur l'icône "${type}" pour l'enchère de ${bid.amount}€`);
  };

  return (
    <div className="enchere-container">
      {/* INPUT */}
      <div className="bid-input-box">
        <input
          type="number"
          placeholder="Votre enchère"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSubmit}>OK</button>
      </div>

      {/* POPUP ERREUR */}
      {showError && (
        <div className="error-popup">
          Allez un peu de nerf ! L'enchère doit être supérieure à la dernière.
        </div>
      )}

      {/* LISTE ENCHÈRES */}
      <div className="bid-list">
        {bids.map((bid, index) => {
          const date = new Date(bid.date).toLocaleString();
          return (
          <div className="bid-infos">
            <div className="bid-row" key={index}>
              
                <span>Pseudo</span> 
                <span>a enchéri le</span>
                <span>{date}</span>
                <span className="price">{bid.amount}€</span>
                <span>commentaire</span>
                <span className="comment">{bid.message || "-"}</span>
                <span>pays promu</span>
                <span>{bid.country || "-"}</span>

              </div>
              
              <div className="icons-ench">
                <a href="#" onClick={() => handleIconClick("feu", bid)}>🔥</a>
                <a href="#" onClick={() => handleIconClick("livre", bid)}>📖</a>
              </div>

           
           </div>  
          );
        })}
      </div>
    </div>
  );
};

export default Enchere;