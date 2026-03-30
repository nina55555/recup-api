import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";
import livreImage from "../assets/blankbook.jpg";
import { supabase } from "../lib/supabase";

const Enchere = ({ onBidSubmit, bids }) => {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastBidIndex, setLastBidIndex] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const listRef = useRef(null);

  const MIN_BID = 5555;
  const lastBid = bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : MIN_BID;

  useEffect(() => {
    if (bids.length > 0) {
      setLastBidIndex(0);
      setTimeout(() => setLastBidIndex(null), 2000);

      if (listRef.current) listRef.current.scrollTop = 0;
    }
  }, [bids]);

  const handleSubmit = () => {
    const numericValue = Number(value);
    if (numericValue <= lastBid) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }
    onBidSubmit(numericValue);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const getPublicMediaUrl = (path) => {
    if (!path) return "";
    const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
    return data.publicUrl;
  };

  // 🔥 ouverture du livre avec récupération médias (SEULEMENT ici)
  const openBook = async (bid) => {
    setLoadingMedia(true);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, pseudo, story, instagram_url, facebook_url, tiktok_url, x_url, youtube_url, linkedin_url"
      )
      .eq("id", bid.user_id)
      .single();

    if (profileError) {
      console.error("Erreur récupération profil :", profileError);
      setLoadingMedia(false);
      return;
    }

    const { data: mediaData, error: mediaError } = await supabase
      .from("profile_media")
      .select("avatar_path, story_image_path, story_video_path")
      .eq("user_id", bid.user_id)
      .single();

    if (mediaError) console.error("Erreur récupération médias :", mediaError);

    const selected = {
      story: bid.story || profile?.story || "Aucune histoire",
      storyImageUrl: getPublicMediaUrl(mediaData?.story_image_path),
      storyVideoUrl: getPublicMediaUrl(mediaData?.story_video_path),
      pseudo: profile?.pseudo || "Anonyme",
      socialLinks: {
        instagram: profile?.instagram_url || "",
        facebook: profile?.facebook_url || "",
        tiktok: profile?.tiktok_url || "",
        x: profile?.x_url || "",
        youtube: profile?.youtube_url || "",
        linkedin: profile?.linkedin_url || "",
      },
    };

    setSelectedStory(selected);
    setShowBook(true);
    setLoadingMedia(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="enchere-container">
      <div className="bid-input-box">
        <input
          type="number"
          placeholder="Entrez votre enchère ici ..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSubmit}> OK</button>
      </div>

      {showError && (
        <div className="error-popup">
          Allez un peu de nerf ! L'enchère doit être supérieure à la dernière.
        </div>
      )}

      <div className="bid-list" ref={listRef}>
        {bids.map((bid, index) => {
          const isNew = index === lastBidIndex;
          const isTopBid = index === 0; // 🔥 PLUS HAUTE ENCHERE

          return (
            <div className={`bid-infos ${isNew ? "new-bid" : ""}`} key={index}>
              <div className="bid-row">
                <div className="bid-row-left">
                  <div className="pseudo">
                    <p>{bid.pseudo || "Anonyme"}</p>
                  </div>

                  <div className="a-encheri">
                    <p>a encheri le:</p>
                  </div>

                  <div className="date">
                    <p>{formatDate(bid.date)}</p>
                  </div>

                  <div className="com">
                    <p>{bid.message || "..."}</p>
                  </div>
                </div>

                <div className="bid-row-right">
                  <div className="price">
                    <p>{bid.amount}EUR</p>
                  </div>

                  <div className="icons-ench">

                    {/* 🔥 FEU UNIQUEMENT SUR LA MEILLEURE ENCHERE */}
                    {isTopBid && (
                      <button title="Meilleure enchère">
                        🔥
                      </button>
                    )}

                    <button title="voir son histoire" onClick={() => openBook(bid)}>
                      📖
                    </button>

                  </div>
                </div>
              </div>

              <div className="pays-promu">
                <p>PAYS PROMU: {bid.country || "-"}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showBook && (
        <div className="book-overlay">
          <div className="book-popup">
            <span className="book-close" onClick={() => setShowBook(false)}>
              ✕
            </span>

            <div className="book-visual">
              <img className="book-image" src={livreImage} alt="Livre ouvert" />

              <div className="book-layer book-layer-left">
                {loadingMedia ? (
                  <div className="book-media-empty">Chargement du média...</div>
                ) : selectedStory?.storyVideoUrl ? (
                  <video
                    autoPlay
                    muted
                    className="book-media"
                    src={selectedStory.storyVideoUrl}
                    controls
                    playsInline
                  />
                ) : selectedStory?.storyImageUrl ? (
                  <img
                    className="book-media"
                    src={selectedStory.storyImageUrl}
                    alt="Illustration de story"
                  />
                ) : (
                  <div className="book-media-empty">Aucune image ajoutée</div>
                )}

                {selectedStory?.socialLinks &&
                  Object.entries(selectedStory.socialLinks).map(
                    ([key, url]) =>
                      url && (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </a>
                      )
                  )}
              </div>

              <div className="book-layer book-layer-right">
                <div className="book-text-panel">
                  <p className="book-author">{selectedStory?.pseudo || "Anonyme"}</p>
                  <p className="book-text">
                    {selectedStory?.story || "Aucune histoire"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enchere;