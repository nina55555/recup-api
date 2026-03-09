import React, { useState } from "react";
import "../css/Enchere.css";

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

  const handleIconClick = (e, type, bid) => {
    e.preventDefault();
    alert(`Vous avez cliqué sur l'icône "${type}" pour l'enchère de ${bid.amount}€`);
  };

  return (
    <div className="enchere-container">

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

      {showError && (
        <div className="error-popup">
          Allez un peu de nerf ! L'enchère doit être supérieure à la dernière.
        </div>
      )}

      <div className="bid-list">
        {bids.map((bid, index) => {
          const date = new Date(bid.date).toLocaleString();

          return (
            <div className="bid-infos" key={index}>
              <div className="bid-row">

                <div className="pseudo">
                  <p>PSEUDO</p>
                </div>

                <div className="a-encheri">
                  <p>a encheri le:</p>
                </div>

                <div className="date">
                  <p>{date}</p>
                </div>

                <div className="com">
                  <p>{bid.message || "....."}</p>
                </div>

                <div className="pays-promu">
                  <p>PAYS PROMU: {bid.country || "-"}</p>
                </div>

                <div className="price">
                  <p>{bid.amount}€</p>
                </div>

                <div className="icons-ench">
                  <a href="#" onClick={(e)=>handleIconClick(e,"feu",bid)}>🔥</a>
                  <a href="#" onClick={(e)=>handleIconClick(e,"livre",bid)}>📖</a>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Enchere;