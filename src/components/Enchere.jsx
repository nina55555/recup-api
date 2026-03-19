import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";

const Enchere = ({ onBidSubmit, bids }) => {

  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastBidIndex, setLastBidIndex] = useState(null);

  const [showBook,setShowBook] = useState(false);
  const [selectedComment,setSelectedComment] = useState("");

  const listRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : MIN_BID;

  useEffect(()=>{

    if(bids.length>0){

      setLastBidIndex(0);

      setTimeout(()=>{
        setLastBidIndex(null);
      },2000);

      if(listRef.current){
        listRef.current.scrollTop = 0;
      }

    }

  },[bids]);


  const handleSubmit = ()=>{

    const numericValue = Number(value);

    if(numericValue <= lastBid){

      setShowError(true);

      setTimeout(()=>{
        setShowError(false);
      },2000);

      return;

    }

    onBidSubmit(numericValue);
    setValue("");

  };


  const handleKeyDown = (e)=>{
    if(e.key === "Enter") handleSubmit();
  };


  const openBook = (comment)=>{

    setSelectedComment(comment || "Aucun commentaire");
    setShowBook(true);

    const audio = new Audio("/src/assets/page.mp3");
    audio.volume = 0.3;
    audio.play();

  };


  return(

    <div className="enchere-container">

      <div className="bid-input-box">

        <input
          type="number"
          placeholder="Votre enchère"
          value={value}
          onChange={(e)=>setValue(e.target.value)}
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

        {bids.map((bid,index)=>{

          const date = new Date(bid.date).toLocaleString();
          const isNew = index === lastBidIndex;

          return(

            <div className={`bid-infos ${isNew ? "new-bid" : ""}`} key={index}>

              <div className="bid-row">

                <div className="pseudo">
                  <p>PSEUDO</p>
                </div>

                <div className="a-encheri">
                  <p>a enchéri le:</p>
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

                  <a href="#">
                    🔥
                  </a>

                  <a
                    href="#"
                    onClick={(e)=>{
                      e.preventDefault();
                      openBook(bid.message);
                    }}
                  >
                    📖
                  </a>

                </div>

              </div>

            </div>

          );

        })}

      </div>


      {/* POPUP LIVRE */}

      {showBook && (

        <div className="book-overlay">

          <div className="book-popup">

            <span
              className="book-close"
              onClick={()=>setShowBook(false)}
            >
              ✕
            </span>

            <div className="book">

              <div className="page left"></div>

              <div className="page right">

                <p className="book-text">
                  {selectedComment}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default Enchere;