import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import {
  buildStoragePath,
  createSignedProfileMediaUrl,
  createEmptySecureProfile,
  getProfileMediaBucket,
  isStorageMissing,
  resolveSecureProfileRecord,
  sanitizeAllSocialLinks,
  validateImageFile,
  validateVideoFile,
} from "../lib/secureProfileMedia";
import "../css/Profile.css";
import "react-toastify/dist/ReactToastify.css";

const EMPTY_PROFILE = {
  pseudo: "",
  story: "",
  email: "",
  password: "",
};

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X / Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
];

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [currentStory, setCurrentStory] = useState("");
  const [bidProducts, setBidProducts] = useState([]);
  const [secureProfile, setSecureProfile] = useState(createEmptySecureProfile());
  const [mediaUrls, setMediaUrls] = useState({
    avatarUrl: "",
    storyImageUrl: "",
    storyVideoUrl: "",
  });

  const bucketName = useMemo(() => getProfileMediaBucket(), []);

  // debug bucket access, à laisser temporaire
  useEffect(() => {
    const checkBucket = async () => {
      const { data, error } = await supabase.storage
        .from("profile-media")
        .list("", { limit: 20 });

      console.log("profile-media list data:", data);
      console.log("profile-media list error:", error);
    };

    checkBucket();
  }, []);

  useEffect(() => {
    const loadMediaUrls = async (profileConfig) => {
      try {
        const [avatarUrl, storyImageUrl, storyVideoUrl] = await Promise.all([
          createSignedProfileMediaUrl(supabase, profileConfig?.avatarPath).catch(() => ""),
          createSignedProfileMediaUrl(supabase, profileConfig?.storyImagePath).catch(() => ""),
          createSignedProfileMediaUrl(supabase, profileConfig?.storyVideoPath).catch(() => ""),
        ]);

        setMediaUrls({
          avatarUrl,
          storyImageUrl,
          storyVideoUrl,
        });
      } catch (error) {
        console.error("Erreur chargement medias signes profil :", error);
      }
    };

    const loadProfile = async () => {
      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError?.name === "AbortError") return;

        if (authError) {
          console.error("Erreur auth profil :", authError);
        }

        if (!currentUser) {
          navigate("/signin");
          return;
        }

        setUser(currentUser);

        const { data: rows, error } = await supabase
          .from("profiles")
          .select("id, pseudo, story, instagram_url, facebook_url, tiktok_url, x_url, youtube_url, linkedin_url")
          .eq("id", currentUser.id)
          .limit(1);

        if (error) {
          console.error("Erreur chargement profil :", error);
          toast.error("Impossible de charger le profil.");
        }

        let profile = rows?.[0] || null;

        if (!profile) {
          const { data: insertedRows, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: currentUser.id,
              pseudo: "",
              story: "",
              instagram_url: "",
              facebook_url: "",
              tiktok_url: "",
              x_url: "",
              youtube_url: "",
              linkedin_url: "",
            })
            .select("id, pseudo, story, instagram_url, facebook_url, tiktok_url, x_url, youtube_url, linkedin_url")
            .limit(1);

          if (insertError) {
            console.error("Erreur creation profil :", insertError);
          } else {
            profile = insertedRows?.[0] || null;
          }
        }

        setFormData({
          pseudo: profile?.pseudo || "",
          story: profile?.story || "",
          email: currentUser.email || "",
          password: "",
        });
        setCurrentStory(profile?.story || "");
        const { data: mediaRows, error: mediaError } = await supabase
          .from("profile_media")
          .select("user_id, avatar_path, story_image_path, story_video_path")
          .eq("user_id", currentUser.id)
          .limit(1);

        if (mediaError) {
          console.error("Erreur chargement media profil :", mediaError);
        }

        let media = mediaRows?.[0] || null;

        if (!media) {
          const { data: insertedMediaRows, error: insertMediaError } = await supabase
            .from("profile_media")
            .insert({
              user_id: currentUser.id,
              avatar_path: "",
              story_image_path: "",
              story_video_path: "",
            })
            .select("user_id, avatar_path, story_image_path, story_video_path")
            .limit(1);

          if (insertMediaError) {
            console.error("Erreur creation media profil :", insertMediaError);
          } else {
            media = insertedMediaRows?.[0] || null;
          }
        }

        const secureRecord = resolveSecureProfileRecord({ profile, media });
        setSecureProfile(secureRecord);
        await loadMediaUrls(secureRecord);

        const { data: bidRows, error: bidsError } = await supabase
          .from("bids")
          .select("product_id, amount, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (bidsError) {
          console.error("Erreur chargement encheres profil :", bidsError);
        } else if (bidRows?.length) {
          const uniqueProductIds = [...new Set(bidRows.map((bid) => bid.product_id).filter(Boolean))];

          if (uniqueProductIds.length === 0) {
            setBidProducts([]);
          } else {
            const { data: productsData, error: productsError } = await supabase
              .from("models")
              .select("id, title, image_url")
              .in("id", uniqueProductIds);

            if (productsError) {
              console.error("Erreur chargement produits profil :", productsError);
              setBidProducts([]);
            } else {
              const linkedProducts = (productsData || [])
                .map((product) => ({
                  id: product.id,
                  title: product.title || "Produit",
                  imageUrl: product.image_url || "",
                }))
                .filter(Boolean);

              setBidProducts(linkedProducts);
            }
          }
        } else {
          setBidProducts([]);
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Erreur inattendue profil :", error);
          toast.error("Impossible de charger le profil.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [bucketName, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setSecureProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const uploadSecureMedia = async ({ file, kind, validator, currentPathKey, currentUrlKey }) => {
    if (!user?.id) {
      toast.error("Session introuvable.");
      return;
    }

    setUploadingKey(kind);

    try {
      const extension = await validator(file);
      const nextPath = buildStoragePath({
        userId: user.id,
        kind,
        extension,
      });

      const previousPath = secureProfile[currentPathKey];

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(nextPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        if (isStorageMissing(uploadError)) {
          throw new Error(
            "Le bucket Supabase n'est pas configure. Lancez le script SQL fourni."
          );
        }

        throw uploadError;
      }

      if (previousPath) {
        const { error: removeError } = await supabase.storage
          .from(bucketName)
          .remove([previousPath]);

        if (removeError) {
          console.error("Erreur suppression ancien media :", removeError);
        }
      }

      setSecureProfile((prev) => ({
        ...prev,
        [currentPathKey]: nextPath,
      }));
      setMediaUrls((prev) => ({
        ...prev,
        [currentUrlKey]: "",
      }));

      const signedUrl = await createSignedProfileMediaUrl(supabase, nextPath).catch(() => "");

      setMediaUrls((prev) => ({
        ...prev,
        [currentUrlKey]: signedUrl,
      }));

      toast.success("Fichier verifie et importe.");
    } catch (error) {
      console.error(`Erreur upload ${kind} :`, error);
      toast.error(error.message || "Import refuse.");
    } finally {
      setUploadingKey("");
    }
  };

  const handleMediaInput = async (event, config) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await uploadSecureMedia({
      file,
      ...config,
    });
  };

  const handleRemoveMedia = async (currentPathKey, currentUrlKey) => {
    const currentPath = secureProfile[currentPathKey];

    if (!currentPath) {
      return;
    }

    try {
      const { error } = await supabase.storage.from(bucketName).remove([currentPath]);

      if (error && !isStorageMissing(error)) {
        throw error;
      }

      setSecureProfile((prev) => ({
        ...prev,
        [currentPathKey]: "",
      }));
      setMediaUrls((prev) => ({
        ...prev,
        [currentUrlKey]: "",
      }));

      toast.success("Media supprime.");
    } catch (error) {
      console.error("Erreur suppression media :", error);
      toast.error(error.message || "Suppression impossible.");
    }
  };

  const saveProfileRow = async (profilePayload) => {
    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", user.id)
      .select("id")
      .limit(1);

    if (updateError) {
      console.error("Erreur mise a jour profil :", updateError);
    }

    if (updatedRows?.length) {
      return null;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      ...profilePayload,
    });

    if (insertError) {
      console.error("Erreur insertion profil :", insertError);
      return insertError;
    }

    return null;
  };

  const saveProfileMediaRow = async (mediaPayload) => {
    const { error } = await supabase.from("profile_media").upsert({
      user_id: user.id,
      ...mediaPayload,
    });

    if (error) {
      console.error("Erreur sauvegarde media profil :", error);
      return error;
    }

    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    try {
      const sanitizedSocialLinks = sanitizeAllSocialLinks(secureProfile.socialLinks);

      const profileError = await saveProfileRow({
        pseudo: formData.pseudo,
        story: formData.story,
        instagram_url: sanitizedSocialLinks.instagram,
        facebook_url: sanitizedSocialLinks.facebook,
        tiktok_url: sanitizedSocialLinks.tiktok,
        x_url: sanitizedSocialLinks.x,
        youtube_url: sanitizedSocialLinks.youtube,
        linkedin_url: sanitizedSocialLinks.linkedin,
      });

      if (profileError) {
        toast.error("Impossible d'enregistrer le profil.");
        return;
      }

      const mediaError = await saveProfileMediaRow({
        avatar_path: secureProfile.avatarPath,
        story_image_path: secureProfile.storyImagePath,
        story_video_path: secureProfile.storyVideoPath,
      });

      if (mediaError) {
        toast.error("Impossible d'enregistrer les medias du profil.");
        return;
      }

      const authUpdates = {};

      if (formData.email && formData.email !== user.email) {
        authUpdates.email = formData.email;
      }

      if (formData.password) {
        authUpdates.password = formData.password;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { data, error: authError } = await supabase.auth.updateUser(authUpdates);

        if (authError) {
          console.error("Erreur mise a jour auth :", authError);
          toast.error(authError.message);
          return;
        }

        if (data?.user) { setUser(data.user); }
      }

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
      setCurrentStory(formData.story);

      toast.success("Profil mis a jour.");
    } catch (error) {
      console.error("Erreur sauvegarde profil :", error);
      toast.error(error.message || "Envoi refuse.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="profile-shell">Chargement du profil...</div>;
  }

  return (
    <div className="profile-shell">
      <div className="profile-card">
        <div className="profile-header">
          <p className="profile-kicker">Espace personnel</p>
          <h1>Votre profil</h1>
          <p className="profile-subtitle">
            Vous seul pouvez consulter et modifier ces informations.
          </p>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <label>
            Modifier mon pseudo
            <input
              type="text"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              required
            />
          </label>

          <div className="profile-story-grid">
            <div className="profile-story-current">
              <span>Mon histoire actuelle</span>
              <div className="profile-story-current-box">
                {currentStory || "Aucune histoire enregistree pour le moment."}
              </div>
            </div>

            <label>
              Modifier mon histoire
              <textarea
                name="story"
                value={formData.story}
                onChange={handleChange}
                placeholder="Votre histoire..."
              />
            </label>
          </div>

          <div className="profile-security-block">
            <div className="profile-bids-header">
              <p>telecharger vos fichiers pour de la visibilite dans votre rubrique livre</p>
            </div>

            <div className="profile-media-grid">
              <div className="profile-upload-card">
                <span>Avatar</span>
                {mediaUrls.avatarUrl ? (
                  <img
                    className="profile-avatar-preview"
                    src={mediaUrls.avatarUrl}
                    alt="Avatar utilisateur"
                  />
                ) : (
                  <div className="profile-upload-placeholder">Aucun avatar</div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingKey === "avatar"}
                  onChange={(event) =>
                    handleMediaInput(event, {
                      kind: "avatar",
                      validator: validateImageFile,
                      currentPathKey: "avatarPath",
                      currentUrlKey: "avatarUrl",
                    })
                  }
                />
                <button
                  type="button"
                  className="profile-inline-action"
                  onClick={() => handleRemoveMedia("avatarPath", "avatarUrl")}
                  disabled={!secureProfile.avatarPath}
                >
                  Retirer
                </button>
              </div>

              <div className="profile-upload-card">
                <span>Image de story</span>
                {mediaUrls.storyImageUrl ? (
                  <img
                    className="profile-story-media-preview"
                    src={mediaUrls.storyImageUrl}
                    alt="Image de story"
                  />
                ) : (
                  <div className="profile-upload-placeholder">Aucune image</div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingKey === "story-image"}
                  onChange={(event) =>
                    handleMediaInput(event, {
                      kind: "story-image",
                      validator: validateImageFile,
                      currentPathKey: "storyImagePath",
                      currentUrlKey: "storyImageUrl",
                    })
                  }
                />
                <button
                  type="button"
                  className="profile-inline-action"
                  onClick={() => handleRemoveMedia("storyImagePath", "storyImageUrl")}
                  disabled={!secureProfile.storyImagePath}
                >
                  Retirer
                </button>
              </div>

              <div className="profile-upload-card">
                <span>Video de story</span>
                {mediaUrls.storyVideoUrl ? (
                  <video
                    className="profile-story-media-preview"
                    src={mediaUrls.storyVideoUrl}
                    controls
                    playsInline
                  />
                ) : (
                  <div className="profile-upload-placeholder">Aucune video</div>
                )}
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  disabled={uploadingKey === "story-video"}
                  onChange={(event) =>
                    handleMediaInput(event, {
                      kind: "story-video",
                      validator: validateVideoFile,
                      currentPathKey: "storyVideoPath",
                      currentUrlKey: "storyVideoUrl",
                    })
                  }
                />
                <button
                  type="button"
                  className="profile-inline-action"
                  onClick={() => handleRemoveMedia("storyVideoPath", "storyVideoUrl")}
                  disabled={!secureProfile.storyVideoPath}
                >
                  Retirer
                </button>
              </div>
            </div>

            <div className="profile-social-grid">
              {SOCIAL_FIELDS.map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    type="url"
                    inputMode="url"
                    placeholder={`https://${field.key}.com/...`}
                    value={secureProfile.socialLinks[field.key]}
                    onChange={(event) =>
                      handleSocialChange(field.key, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="profile-bids-block">
            <div className="profile-bids-header">
              <span>Mes encheres en cours</span>
              <p>Acces rapide aux pages produit ou vous avez deja encheri.</p>
            </div>

            {bidProducts.length > 0 ? (
              <div className="profile-bids-list">
                {bidProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="profile-bid-link"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img
                      className="profile-bid-thumb"
                      src={product.imageUrl}
                      alt={product.title}
                    />
                    <span>{product.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="profile-bids-empty">
                Aucune enchere enregistree pour le moment.
              </div>
            )}
          </div>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Nouveau mot de passe
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Laisser vide pour ne pas changer"
            />
          </label>

          <div className="profile-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="profile-secondary" onClick={handleSignOut}>
              Se deconnecter
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;