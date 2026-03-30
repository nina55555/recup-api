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
    message: "",
  });
  const [bids, setBids] = useState([]);
  const [user, setUser] = useState(null);
  const [bidderProfile, setBidderProfile] = useState(null);

  const getMediaUrl = (path) => {
    if (!path) return "";
    return supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
  };

  const fetchBids = async () => {
    if (!id) return;

    try {
      const { data: bidRows, error: bidError } = await supabase
        .from("bids")
        .select("amount, message, created_at, user_id")
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
            "id, pseudo, country, story, instagram_url, facebook_url, tiktok_url, x_url, youtube_url, linkedin_url"
          )
          .in("id", userIds);

        if (profileError) {
          console.error("Erreur chargement des profils :", profileError);
        } else {
          profilesById = Object.fromEntries(profileRows.map((profile) => [profile.id, profile]));
        }
      }

      const mediaRowsByUserId = {};
      if (userIds.length > 0) {
        const { data: mediaRows, error: mediaError } = await supabase
          .from("profile_media")
          .select("user_id, avatar_path, story_image_path, story_video_path")
          .in("user_id", userIds);

        if (mediaError) {
          console.error("Erreur recuperation medias :", mediaError);
        }

        mediaRows?.forEach((media) => {
          mediaRowsByUserId[media.user_id] = {
            avatar: getMediaUrl(media.avatar_path),
            story_image: getMediaUrl(media.story_image_path),
            story_video: getMediaUrl(media.story_video_path),
          };
        });
      }

      const formatted = bidRows.map((bid) => {
        const profile = profilesById[bid.user_id] || {};
        const media = mediaRowsByUserId[bid.user_id] || {};

        return {
          amount: bid.amount,
          message: bid.message,
          country: profile.country || "-",
          pseudo: profile.pseudo || "Anonyme",
          story: profile.story || "",
          avatarUrl: media.avatar || "",
          storyImageUrl: media.story_image || "",
          storyVideoUrl: media.story_video || "",
          socialLinks: {
            instagram: profile.instagram_url || "",
            facebook: profile.facebook_url || "",
            tiktok: profile.tiktok_url || "",
            x: profile.x_url || "",
            youtube: profile.youtube_url || "",
            linkedin: profile.linkedin_url || "",
          },
          user_id: bid.user_id,
          date: bid.created_at,
        };
      });

      setBids(formatted);
    } catch (error) {
      console.error("Erreur fetchBids :", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error?.name !== "AbortError" && error) {
          console.error("Erreur recuperation user :", error);
        }

        if (data?.user) {
          setUser(data.user);

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, pseudo, country, story")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Erreur chargement profil enchere :", profileError);
          } else {
            setBidderProfile(profile);
          }
        }
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
          console.error("Erreur recuperation produit:", error);
          toast.error("Erreur chargement produit");
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (error) {
        console.error("Erreur inattendue:", error);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!bidderProfile?.pseudo || !bidderProfile?.country) {
      toast.error("Renseignez pseudo et pays promu dans votre profil.");
      return;
    }

    const { error } = await supabase.from("bids").insert([
      {
        amount: bidValue,
        message: formData.message,
        country: bidderProfile.country,
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
    setFormData({ message: "" });
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
              x
            </button>
            <h3>Ton enchere</h3>

            <form onSubmit={handleFormSubmit}>
              <textarea
                name="message"
                placeholder="Commentaire"
                value={formData.message}
                onChange={handleChange}
              />

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
