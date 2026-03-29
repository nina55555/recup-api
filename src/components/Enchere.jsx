import React, { useState, useEffect, useRef } from "react";
import "../css/Enchere.css";
import livreImage from "../assets/blankbook.jpg";
import { createSignedProfileMediaUrl } from "../lib/secureProfileMedia";
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
  const lastBid =
    bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : MIN_BID;

  useEffect(() => {
    if (bids.length > 0) {
      setLastBidIndex(0);
      setTimeout(() => setLastBidIndex(null), 2000);

      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
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

  const openBook = async (bid) => {
    setLoadingMedia(true);

    // Récupérer le profil pour le texte et les liens sociaux
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, pseudo, story, instagram_url, facebook_url, tiktok_url, x_url, youtube_url, linkedin_url"
      )
      .eq("id", bid.user_id)
      .single();

    if (profileError) {
      console.error("Erreur récupération profil pour popup :", profileError);
      setLoadingMedia(false);
      return;
    }

    // Récupérer les chemins médias depuis profile_media
    const { data: mediaData, error: mediaError } = await supabase
      .from("profile_media")
      .select("story_image_path, story_video_path")
      .eq("user_id", bid.user_id)
      .single();

    if (mediaError) {
      console.error("Erreur récupération médias pour popup :", mediaError);
      setLoadingMedia(false);
      return;
    }

    // Générer les URLs signées fraîches depuis les chemins de profile_media
    const freshStoryImageUrl = mediaData?.story_image_path
      ? await createSignedProfileMediaUrl(supabase, mediaData.story_image_path)
      : "";
    const freshStoryVideoUrl = mediaData?.story_video_path
      ? await createSignedProfileMediaUrl(supabase, mediaData.story_video_path)
      : "";

    const selected = {
      story: bid.story || profile?.story || "Aucune histoire",
      storyImageUrl: freshStoryImageUrl,
      storyVideoUrl: freshStoryVideoUrl,
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
    console.log("selectedStory:", selected);
    setShowBook(true);
    setLoadingMedia(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} a ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="enchere-container">
      <div className="bid-input-box">
        <input
          type="number"
          placeholder="Entrez votre enchere ici ..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSubmit}>OK</button>
      </div>

      {showError && (
        <div className="error-popup">
          Allez un peu de nerf ! L'enchere doit etre superieure a la derniere.
        </div>
      )}

      <div className="bid-list" ref={listRef}>
        {bids.map((bid, index) => {
          const isNew = index === lastBidIndex;

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
                    <a href="#">🔥</a>
                    <a
                      href="#"
                      title="lire son histoire"
                      onClick={(e) => {
                        e.preventDefault();
                        openBook(bid);
                      }}
                    >
                      📖
                    </a>
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
                  <div className="book-media-empty">Aucune image ajoutee</div>
                )}

                {selectedStory?.socialLinks &&
                  Object.keys(selectedStory.socialLinks).length > 0 && (
                    <div className="book-social-links">
                      {selectedStory.socialLinks.facebook && (
                        <a
                          href={selectedStory.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                      )}
                      {selectedStory.socialLinks.twitter && (
                        <a
                          href={selectedStory.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                        </a>
                      )}
                      {selectedStory.socialLinks.instagram && (
                        <a
                          href={selectedStory.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </a>
                      )}
                      {selectedStory.socialLinks.tiktok && (
                        <a
                          href={selectedStory.socialLinks.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          TikTok
                        </a>
                      )}
                      {selectedStory.socialLinks.linkedin && (
                        <a
                          href={selectedStory.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
              </div>

              <div className="book-layer book-layer-right">
                <div className="book-text-panel">
                  <p className="book-author">{selectedStory?.pseudo || "Anonyme"}</p>
                  <p className="book-text">{selectedStory?.story || "Aucune histoire"}</p>
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
