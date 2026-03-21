import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Countdown from "../components/Countdown";
import Icons from "../components/Icons";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Product.css";
import Enchere from "../components/Enchere.jsx";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [bidValue, setBidValue] = useState(null);

  const [formData, setFormData] = useState({
    pseudo: "",
    story: "",
    message: "",
    country: ""
  });

  const [bids, setBids] = useState([]);
  const [user, setUser] = useState(null);

  // USER
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  // PRODUCT
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5978/defilons/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch {
        toast.error("Erreur chargement produit");
      } finally {
        setLoading(false);
      }
    };
    if (id) getProduct();
  }, [id]);

  // FETCH BIDS
  useEffect(() => {
    if (!id) return;

    const fetchBids = async () => {
      const { data } = await supabase
        .from("bids")
        .select(`
          amount,
          message,
          country,
          created_at,
          user_id,
          profiles (pseudo, story)
        `)
        .eq("product_id", id)
        .order("amount", { ascending: false });

      if (!data) return;

      const formatted = data.map((b) => ({
        amount: b.amount,
        message: b.message,
        country: b.country,
        pseudo: b.profiles?.pseudo || "Anonyme",
        story: b.profiles?.story || "",
        user_id: b.user_id,
        date: b.created_at
      }));

      setBids(formatted);

      console.log("BIDS DATA:", data);
      
    };

    fetchBids();
  }, [id]);

  // CLICK ENCHERE
  const handleBidSubmit = (value) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    setBidValue(value);
    setShowPopup(true);
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // SUBMIT
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 🔹 1. INSERT PROFILE (si pas existant)
    await supabase.from("profiles").upsert({
      id: user.id,
      pseudo: formData.pseudo,
      story: formData.story
    });

    // 🔹 2. INSERT BID
    const { error } = await supabase.from("bids").insert([
      {
        amount: bidValue,
        message: formData.message,
        country: formData.country,
        user_id: user.id,
        product_id: id
      }
    ]);

    if (error) {
      toast.error("Erreur enchère");
      return;
    }

    toast.success("Enchère envoyée !");
    setShowPopup(false);
    setFormData({
      pseudo: "",
      story: "",
      message: "",
      country: ""
    });
  };

  if (loading) return <div>Chargement...</div>;
  if (!product) return <div>Produit introuvable</div>;

  return (
    <div className="main--box">

      <Countdown />

      <div className="big--box">
        <div className="images--box">
          <img className="paint" src="../src/assets/wallpaint.jpg" />
          <div className="product-overlay">
            <img className="podium" src={product.imageUrl} />
            <h2>{product.title}</h2>
          </div>
        </div>
      </div>

      <Enchere onBidSubmit={handleBidSubmit} bids={bids} />

      <Icons />

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-form">

            <h3>Ton enchère</h3>

            <form onSubmit={handleFormSubmit}>

              <input
                type="text"
                name="pseudo"
                placeholder="Ton pseudo"
                value={formData.pseudo}
                onChange={handleChange}
                required
              />

              <textarea
                name="story"
                placeholder="Ton histoire (optionnel)"
                value={formData.story}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Commentaire"
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

              <button type="submit">Valider l'enchère</button>

            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Product;