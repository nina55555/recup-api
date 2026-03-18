import React, { useState } from "react";
import "./Enchere.css";

const Enchere = () => {
  const [bids, setBids] = useState([]);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const handleBid = () => {
    if (!price) {
      setError("Veuillez entrer un montant");
      return;
    }

    const newBid = {
      id: Date.now(),
      pseudo: "Utilisateur",
      comment: "a enchéri",
      country: "France",
      date: new Date().toLocaleTimeString(),
      price: price,
    };

    setBids([newBid, ...bids]);
    setPrice("");
    setError("");
  };

  return (
    <div className="enchere-container">

      {/* ERREUR */}
      {error && <div className="error-popup">{error}</div>}

      {/* INPUT */}
      <div className="bid-input-box">
        <input
          type="number"
          placeholder="Votre enchère"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={handleBid}>Enchérir</button>
      </div>

      {/* LISTE */}
      <div className="bid-list">
        {bids.map((bid, index) => (
          <div
            key={bid.id}
            className={`bid-infos ${index === 0 ? "new-bid" : ""}`}
          >
            <div className="bid-row">

              <div className="pseudo">
                <p>{bid.pseudo}</p>
              </div>

              <div className="a-encheri">
                <p>{bid.comment}</p>
              </div>

              <div className="com">
                <p>"{bid.comment}"</p>
              </div>

              <div className="pays-promu">
                <p>{bid.country}</p>
              </div>

              <div className="date">
                <p>{bid.date}</p>
              </div>

              <div className="price">
                <p>{bid.price} €</p>
              </div>

              {/* ICONES (optionnel mais prévu dans ton CSS) */}
              <div className="icons-ench">
                <a href="#">❤️</a>
                <a href="#">⭐</a>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Enchere;