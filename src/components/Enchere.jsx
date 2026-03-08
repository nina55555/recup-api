import React, { useState } from "react";

const Enchere = ({ productId, onBidSubmit, bids }) => {

  const [value, setValue] = useState("");

  const handleSubmit = () => {

    if (!value) return;

    onBidSubmit(value);

    setValue("");
  };

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleSubmit();
    }

  };

  return (

    <div className="enchere-container">

      <div className="bid-input-box">

        <input
          type="number"
          placeholder="Entrer une enchère..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={handleSubmit}>
          OK
        </button>

      </div>

      <div className="bid-list">

        {bids && bids.length === 0 && (
          <p className="no-bid">Aucune enchère pour le moment</p>
        )}

        {bids && bids.map((bid, index) => (

          <div className="bid-item" key={index}>

            <div className="bid-price">
              {bid.amount} €
            </div>

            {bid.message && (
              <div className="bid-message">
                {bid.message}
              </div>
            )}

            <div className="bid-meta">
              {bid.country} • {new Date(bid.date).toLocaleTimeString()}
            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default Enchere;