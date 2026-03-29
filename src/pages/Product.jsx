import React, { useEffect, useState } from "react";
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
    country: "",
  });
  const [bids, setBids] = useState([]);
  const [user, setUser] = useState(null);

  const fetchBids = async () => {
    if (!id) return;

    const { data: bidRows, error: bidError } = await supabase
      .from("bids")
      .select("amount, message, country, created_at, user_id")
      .eq("product_id", id)
      .order("amount", { ascending: false });

    if (bidError) {
      console.error("Erreur chargement des encheres :", bidError);
      toast.error("Erreur chargement encheres");
      return;
    }

    if (!bidRows?.length) {
      setBids([]);
      return;
    }

    const userIds = [...new Set(bidRows.map((bid) => bid.user_id).filter(Boolean))];
    let profilesById = {};

    if (userIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, pseudo, story, avatar_url, story_image_url, story_video_url, instagram_url, facebook_url, tiktok_url, x_url, youtube_url, linkedin_url"
        )
        .in("id", userIds);

      if (profileError) {
        console.error("Erreur chargement des profils lies aux encheres :", profileError);
      } else {
        profilesById = Object.fromEntries(
          profileRows.map((profile) => [profile.id, profile])
        );
      }
    }

    const formatted = bidRows.map((bid) => {
      const profile = profilesById[bid.user_id];

      return {
        amount: bid.amount,
        message: bid.message,
        country: bid.country,
        pseudo: profile?.pseudo || "Anonyme",
        story: profile?.story || "",
        avatarUrl: profile?.avatar_url || "",
        storyImageUrl: profile?.story_image_url || "",
        storyVideoUrl: profile?.story_video_url || "",
        socialLinks: {
          instagram: profile?.instagram_url || "",
          facebook: profile?.facebook_url || "",
          tiktok: profile?.tiktok_url || "",
          x: profile?.x_url || "",
          youtube: profile?.youtube_url || "",
          linkedin: profile?.linkedin_url || "",
        },
        user_id: bid.user_id,
        date: bid.created_at,
      };
    });

    setBids(formatted);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error?.name === "AbortError") return;
        if (error) {
          console.error("Erreur recuperation user :", error);
          return;
        }
        if (data?.user) setUser(data.user);
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Erreur auth product :", error);
        }
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("models")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erreur récupération produit:", error);
          toast.error("Erreur chargement produit");
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error("Erreur inattendue:", err);
        toast.error("Erreur chargement produit");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) getProduct();
  }, [id]);

  useEffect(() => {
    fetchBids();
  }, [id]);

  const handleBidSubmit = (value) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    setBidValue(value);
    setShowPopup(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      pseudo: formData.pseudo,
      story: formData.story,
    });

    if (profileError) {
      console.error("Erreur profil avant enchere :", profileError);
      toast.error("Impossible d'enregistrer le pseudo");
      return;
    }

    const { error } = await supabase.from("bids").insert([
      {
        amount: bidValue,
        message: formData.message,
        country: formData.country,
        user_id: user.id,
        product_id: id,
      },
    ]);

    if (error) {
      console.error("Erreur insertion enchere :", error);
      toast.error("Erreur enchere");
      return;
    }

    toast.success("Enchere envoyee !");
    setShowPopup(false);
    await fetchBids();
    setFormData({
      pseudo: "",
      story: "",
      message: "",
      country: "",
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
            <img className="podium" src={product.image_url} />
            <h2>{product.title}</h2>
          </div>
        </div>
      </div>

      <Enchere onBidSubmit={handleBidSubmit} bids={bids} />

      <Icons />

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <button
              type="button"
              className="product-popup-close"
              onClick={() => setShowPopup(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h3>Ton enchere</h3>

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

              <button type="submit">Valider l'enchere</button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Product;
