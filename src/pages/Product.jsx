
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Countdown from "../components/Countdown";
import EncherePremium from "../components/EncherePremium";
import Icons from "../components/Icons";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Product.css";
import "../components/Enchere.jsx";
import "../css/Enchere.css";

import Enchere from "../components/Enchere.jsx";




const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [bidValue, setBidValue] = useState(null);
  const [formData, setFormData] = useState({ message: "", country: "" });

  const [bids, setBids] = useState([]);
  const [user, setUser] = useState(null);
  const [pseudo, setPseudo] = useState("");

  // 🔹 USER
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  // 🔹 PROFILE
  useEffect(() => {
    if (!user) return;

    const getProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", user.id)
        .single();
      if (data) setPseudo(data.pseudo);
    };

    getProfile();
  }, [user]);

  // 🔹 PRODUCT
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5978/defilons/${id}`);
        if (!res.ok) throw new Error();
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

  // 🔹 FETCH BIDS
  useEffect(() => {
    if (!id) return;

    const fetchBids = async () => {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          amount,
          message,
          country,
          created_at,
          profiles (pseudo)
        `)
        .eq("product_id", id)
        .order("amount", { ascending: false });

      if (error) {
        console.error("Erreur bids:", error.message);
        return;
      }

      const formatted = data.map((b) => ({
        amount: b.amount,
        message: b.message,
        country: b.country,
        pseudo: b.profiles?.pseudo || "Anonyme",
        date: b.created_at
      }));

      setBids(formatted);
    };

    fetchBids();
  }, [id]);

  // 🔥 REALTIME BIDS
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel("bids-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `product_id=eq.${id}`
        },
        (payload) => {
          const newBid = {
            amount: payload.new.amount,
            message: payload.new.message,
            country: payload.new.country,
            pseudo: pseudo || "Anonyme",
            date: payload.new.created_at
          };
          setBids((prev) => [newBid, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, pseudo]);

  // 🔹 CLICK ENCHÈRE
  const handleBidSubmit = (value) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (!value || value <= 0) {
      toast.error("Montant invalide");
      return;
    }
    setBidValue(value);
    setShowPopup(true);
  };

  // 🔹 FORM CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 🔹 SUBMIT
  const handleFormSubmit = async (e) => {
    e.preventDefault();

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
      console.error(error);
      toast.error("Erreur ajout enchère");
      return;
    }

    toast.success("Enchère ajoutée !");
    setShowPopup(false);
    setFormData({ message: "", country: "" });
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!product) return <div>Produit introuvable</div>;





  return (
    <div className="main--box">


<Countdown />

      {/* IMAGE */}
      <div className="big--box">
        <div className="images--box">
          <img className="paint" src="../src/assets/wallpaint.jpg"  />
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

  
  <Enchere onBidSubmit={handleBidSubmit} bids={bids} />

  <Icons />

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Commentaire</h3>
            <form onSubmit={handleFormSubmit}>
              <textarea
                name="message"
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












      