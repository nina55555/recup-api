import { useState } from "react";  
import '../css/Enchere.css';
import { FaThumbsUp, FaThumbsDown, FaBook } from "react-icons/fa"; // icônes

function Enchere({ productId }) {
  const [sommes, setSommes] = useState([5555]);
  const [newSomme, setNewSomme] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    setNewSomme(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sommesCopy = [...sommes];
    const max = Math.max(...sommesCopy);
    if (max > newSomme) {
      alert("Allons un peu de nerf");
      setNewSomme("");
      return;
    }
    sommesCopy.push(newSomme);
    setSommes(sommesCopy);
    setNewSomme("");
  };

  const handleDelete = (delsomme) => {
    const sommesCopy = [...sommes];
    const sommesCopyUpdated = sommesCopy.filter((somme) => somme !== delsomme);
    setSommes(sommesCopyUpdated);
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
                  Pseudo: à encherit le: 25/07/85 à: 9:00:00 {somme} $ comment: ..........................................
                </p>
                <div className="enchere-icons">
                  <a href="#" title="Like"><FaThumbsUp /></a>
                  <a href="#" title="Dislike"><FaThumbsDown /></a>
                  <a href="#" title="Book"><FaBook /></a>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Enchere;