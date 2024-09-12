import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import '../css/Enchere.css'

function Enchere() {
  //etat
  const [sommes, setSommes] = useState([5555
  ]);
  
  const [newSomme, setNewSomme] = useState("");

  //comportements
  const handleChange = (e) => {
    e.preventDefault();
    setNewSomme(e.target.value);
  };

      const handleSubmit = (e) => {
        e.preventDefault();
        //chercher comparateur de stringify >
        //changer le mode string en number
        console.log (JSON.stringify(newSomme))
        console.log (JSON.stringify(sommes))
      
        const sommesCopy = [...sommes];
        const max = Math.max(...sommesCopy)
        console.log(max)
        if (max>newSomme){
          alert("allons un peu de nerf"),
        setNewSomme("");
          return;
        }
        sommesCopy.push(newSomme);
        setSommes(sommesCopy);
        setNewSomme("");
}

  const handleDelete = (delsomme) => {
    const sommesCopy = [...sommes];
    const sommesCopyUpdated = sommesCopy.filter((somme) => somme !== delsomme);
    setSommes(sommesCopyUpdated);
  };

  //rendu
  return (
    <>
      <div className="bigTable">
        <form action="submit" onSubmit={handleSubmit}>
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

            .sort ((b, a) => (b && b.length > 5555 && a ? 1 : ' '))
            //sort.direction ==="ASC"
            .sort ((a,b) => (b - a) )

            .map((somme,i) => (
              <li key={i}>
                <p>Pseudo: à encherit le: 25/07/85 à: 9:00:00 {somme} $ comment: .......................................... O   O   O   
                  

                  {/* managing personal account to delete
                    <button onClick={() => handleDelete(somme)}>X</button>
                  */}
                </p>
                
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}

export default Enchere;

