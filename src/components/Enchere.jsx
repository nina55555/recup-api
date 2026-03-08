import { useState } from "react";
import '../css/Enchere.css';
import { FaThumbsUp, FaBook } from "react-icons/fa";

function Enchere({ productId }) {

  const [sommes, setSommes] = useState([5555]);
  const [newSomme, setNewSomme] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("");

  const countries = [
    "France",
    "USA",
    "UK",
    "Germany",
    "Italy",
    "Spain",
    "Japan",
    "Canada",
    "Brazil"
  ];

  const handleChange = (e) => {
    setNewSomme(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const max = Math.max(...sommes);

    if (max > newSomme) {
      alert("Allons un peu de nerf");
      setNewSomme("");
      return;
    }

    setShowPopup(true);
  };

  const handlePopupSubmit = (e) => {

    e.preventDefault();

    const sommesCopy = [...sommes];

    sommesCopy.push(newSomme);

    setSommes(sommesCopy);

    setShowPopup(false);

    setNewSomme("");
    setMessage("");
    setCountry("");

  };

  return (
    <div className="bigTable">

      <h3>Enchères pour le produit : {productId}</h3>

      <form onSubmit={handleSubmit}>

        <input
          value={newSomme}
          type="number"
          placeholder="entrez une somme"
          onChange={handleChange}
        />

        <button>ok</button>

      </form>

      <h1>Most recent bids :</h1>

      <ul>

        {sommes
          .sort((a,b) => b - a)
          .map((somme, i) => (

            <li key={i}>

              <div className="enchere-row">

                <p>
                  Pseudo: à encherit le: 25/07/85 à: 9:00:00 
                  {somme} $
                  comment: {message || "...."}
                </p>

                <div className="enchere-icons">

                  <a href="#" title="Like">
                    <FaThumbsUp />
                  </a>

                  <a href="#" title="Book">
                    <FaBook />
                  </a>

                </div>

              </div>

            </li>

          ))}

      </ul>


      {showPopup && (

        <div className="popup-overlay">

          <div className="popup-form">

            <h3>Say something about your bid</h3>

            <textarea
              placeholder="write a few lines..."
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
            />

            <div className="popup-options">

              <button
                type="button"
                onClick={()=>{}}
              >
                Write now
              </button>

              <button
                type="button"
                onClick={()=>setShowPopup(false)}
              >
                Write later
              </button>

            </div>

            <select
              value={country}
              onChange={(e)=>setCountry(e.target.value)}
            >

              <option value="">Select country</option>

              {countries.map((c,i)=>(
                <option key={i} value={c}>
                  {c}
                </option>
              ))}

            </select>

            <button
              className="validate-bid"
              onClick={handlePopupSubmit}
            >
              Validate bid
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Enchere;