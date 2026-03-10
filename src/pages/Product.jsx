import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Countdown from "../components/Countdown";
import Enchere from "../components/Enchere";
import Icons from "../components/Icons";
import "../css/Product.css";

const Product = () => {

  const { id } = useParams();

  const [product,setProduct] = useState(null);
  const [loading,setLoading] = useState(true);

  const [showPopup,setShowPopup] = useState(false);
  const [showStripe,setShowStripe] = useState(false);

  const [bidValue,setBidValue] = useState(null);

  const [formData,setFormData] = useState({
    message:"",
    country:""
  });

  const [bids,setBids] = useState([
    {
      amount:5555,
      message:"Ouverture des enchères",
      country:"France",
      date:new Date()
    }
  ]);

  useEffect(()=>{

    const getProduct = async()=>{

      try{

        const response = await fetch(
          `http://localhost:5978/defilons/${id}`
        );

        const data = await response.json();

        setProduct(data);

      }catch(error){

        console.error(error);

      }finally{

        setLoading(false);

      }

    };

    if(id) getProduct();

  },[id]);

  const handleBidSubmit = (value)=>{

    setBidValue(value);
    setShowPopup(true);

  };

  const handleChange = (e)=>{

    const {name,value} = e.target;

    setFormData({
      ...formData,
      [name]:value
    });

  };

  const handleFormSubmit = (e)=>{

    e.preventDefault();

    if(!formData.country) return;

    setShowPopup(false);
    setShowStripe(true);

  };

  const handleFakePayment = () => {

    setTimeout(()=>{

      const newBid = {

        amount:bidValue,
        message:formData.message,
        country:formData.country,
        date:new Date()

      };

      setBids([newBid,...bids]);

      setShowStripe(false);

      setFormData({
        message:"",
        country:""
      });

    },1500);

  };

  if(loading) return <div className="main--box">Loading...</div>;
  if(!product) return <div className="main--box">Produit introuvable</div>;

  return(

    <div className="main--box">

      <Countdown/>

      <div className="big--box">

        <div className="images--box">

          <img
            className="paint"
            src="/src/assets/wallpaint.jpg"
            alt="wall"
          />

          <div className="product-overlay">

            <img
              className="podium"
              src={product.imageUrl}
              alt={product.title}
            />

            <h2>{product.title}</h2>

          </div>

        </div>

      </div>

      <Enchere
        bids={bids}
        onBidSubmit={handleBidSubmit}
      />

      <Icons/>

      {/* POPUP FORMULAIRE */}

      {showPopup && (

        <div className="popup-overlay">

          <div className="popup-form">

            <h3>Commentaire</h3>

            <form onSubmit={handleFormSubmit}>

              <textarea
                name="message"
                placeholder="Ecrire quelques lignes"
                value={formData.message}
                onChange={handleChange}
              />

              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >

                <option value="">Choisir un pays</option>
                <option>France</option>
                <option>Italie</option>
                <option>Espagne</option>
                <option>Allemagne</option>
                <option>Belgique</option>

              </select>

              <button type="submit">
                Valider
              </button>

            </form>

          </div>

        </div>

      )}

      {/* FAKE STRIPE POPUP */}

      {showStripe && (

        <div className="popup-overlay">

          <div className="stripe-popup">

            <h3>Paiement sécurisé</h3>

            <p>Montant de l'enchère</p>

            <h2>{bidValue} €</h2>

            <div className="fake-card">

              <input placeholder="4242 4242 4242 4242"/>
              <input placeholder="MM/YY"/>
              <input placeholder="CVC"/>

            </div>

            <button
              className="stripe-pay"
              onClick={handleFakePayment}
            >
              Payer l'enchère (Vous serez debité de 10% de la somme a la fin de l'enchere si vous l'emportez, vous reglerez le reste avec la styliste lors du premier essayage)
            </button>

            <button
              className="stripe-cancel"
              onClick={()=>setShowStripe(false)}
            >
              Annuler
            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default Product;