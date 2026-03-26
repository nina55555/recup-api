import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import "../css/Profile.css";
import "react-toastify/dist/ReactToastify.css";

const PROFILE_MEDIA_BUCKET = "profile-media";

const EMPTY_PROFILE = {
  pseudo: "",
  story: "",
  email: "",
  password: "",
  avatarUrl: "",
  storyImageUrl: "",
  storyVideoUrl: "",
};

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];

const sanitizeFileName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");

const getFileExtension = (fileName) => fileName.split(".").pop()?.toLowerCase() || "";

const validateFile = ({ file, allowedMimeTypes, allowedExtensions, maxBytes, label }) => {
  if (!file) return `${label} introuvable.`;

  const extension = getFileExtension(file.name);

  if (!allowedMimeTypes.includes(file.type) || !allowedExtensions.includes(extension)) {
    return `${label} non autorisé.`;
  }

  if (file.size > maxBytes) {
    return `${label} trop volumineux.`;
  }

  return null;
};

const buildStoragePath = (userId, folder, file) => {
  const extension = getFileExtension(file.name);
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  return `${userId}/${folder}/${Date.now()}-${safeName}.${extension}`;
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [currentStory, setCurrentStory] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [storyImageFile, setStoryImageFile] = useState(null);
  const [storyVideoFile, setStoryVideoFile] = useState(null);

  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : formData.avatarUrl),
    [avatarFile, formData.avatarUrl]
  );

  const storyImagePreview = useMemo(
    () => (storyImageFile ? URL.createObjectURL(storyImageFile) : formData.storyImageUrl),
    [storyImageFile, formData.storyImageUrl]
  );

  const storyVideoPreview = useMemo(
    () => (storyVideoFile ? URL.createObjectURL(storyVideoFile) : formData.storyVideoUrl),
    [storyVideoFile, formData.storyVideoUrl]
  );

  useEffect(() => {
    return () => {
      if (avatarFile) URL.revokeObjectURL(avatarPreview);
      if (storyImageFile) URL.revokeObjectURL(storyImagePreview);
      if (storyVideoFile) URL.revokeObjectURL(storyVideoPreview);
    };
  }, [avatarFile, avatarPreview, storyImageFile, storyImagePreview, storyVideoFile, storyVideoPreview]);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        navigate("/signin");
        return;
      }

      setUser(currentUser);

      const { data, error } = await supabase
        .from("profiles")
        .select("pseudo, story, avatar_url, story_image_url, story_video_url")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        toast.error("Impossible de charger le profil.");
      }

      setFormData({
        pseudo: data?.pseudo || "",
        story: data?.story || "",
        email: currentUser.email || "",
        password: "",
        avatarUrl: data?.avatar_url || "",
        storyImageUrl: data?.story_image_url || "",
        storyVideoUrl: data?.story_video_url || "",
      });
      setCurrentStory(data?.story || "");

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter, validationConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile({ file, ...validationConfig });
    if (error) {
      toast.error(error);
      e.target.value = "";
      return;
    }

    setter(file);
  };

  const uploadFileIfNeeded = async ({ file, currentUrl, folder, validationConfig }) => {
    if (!file || !user) return currentUrl;

    const error = validateFile({ file, ...validationConfig });
    if (error) {
      throw new Error(error);
    }

    const storagePath = buildStoragePath(user.id, folder, file);

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_MEDIA_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(storagePath);

    return data.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    try {
      const avatarUrl = await uploadFileIfNeeded({
        file: avatarFile,
        currentUrl: formData.avatarUrl,
        folder: "avatar",
        validationConfig: {
          allowedMimeTypes: IMAGE_MIME_TYPES,
          allowedExtensions: IMAGE_EXTENSIONS,
          maxBytes: 5 * 1024 * 1024,
          label: "Photo de profil",
        },
      });

      const storyImageUrl = await uploadFileIfNeeded({
        file: storyImageFile,
        currentUrl: formData.storyImageUrl,
        folder: "story-image",
        validationConfig: {
          allowedMimeTypes: IMAGE_MIME_TYPES,
          allowedExtensions: IMAGE_EXTENSIONS,
          maxBytes: 8 * 1024 * 1024,
          label: "Image de story",
        },
      });

      const storyVideoUrl = await uploadFileIfNeeded({
        file: storyVideoFile,
        currentUrl: formData.storyVideoUrl,
        folder: "story-video",
        validationConfig: {
          allowedMimeTypes: VIDEO_MIME_TYPES,
          allowedExtensions: VIDEO_EXTENSIONS,
          maxBytes: 25 * 1024 * 1024,
          label: "Vidéo de story",
        },
      });

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        pseudo: formData.pseudo,
        story: formData.story,
        avatar_url: avatarUrl,
        story_image_url: storyImageUrl,
        story_video_url: storyVideoUrl,
      });

      if (profileError) {
        toast.error("Impossible d'enregistrer le profil.");
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
          toast.error(authError.message);
          return;
        }

        if (data?.user) {
          setUser(data.user);
        }
      }

      setFormData((prev) => ({
        ...prev,
        avatarUrl,
        storyImageUrl,
        storyVideoUrl,
        password: "",
      }));
      setCurrentStory(formData.story);

      setAvatarFile(null);
      setStoryImageFile(null);
      setStoryVideoFile(null);

      toast.success("Profil mis à jour.");
    } catch (error) {
      toast.error(error.message || "Envoi refusé.");
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
          <div className="profile-media-grid">
            <label className="profile-upload-card">
              Photo de profil
              {avatarPreview ? (
                <img className="profile-avatar-preview" src={avatarPreview} alt="Prévisualisation profil" />
              ) : (
                <div className="profile-upload-placeholder">Aperçu profil</div>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  handleFileChange(e, setAvatarFile, {
                    allowedMimeTypes: IMAGE_MIME_TYPES,
                    allowedExtensions: IMAGE_EXTENSIONS,
                    maxBytes: 5 * 1024 * 1024,
                    label: "Photo de profil",
                  })
                }
              />
            </label>
          </div>

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
                {currentStory || "Aucune histoire enregistrée pour le moment."}
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

          <div className="profile-media-grid">
            <label className="profile-upload-card">
              Image de story
              {storyImagePreview ? (
                <img className="profile-story-media-preview" src={storyImagePreview} alt="Prévisualisation story" />
              ) : (
                <div className="profile-upload-placeholder">Aperçu image</div>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  handleFileChange(e, setStoryImageFile, {
                    allowedMimeTypes: IMAGE_MIME_TYPES,
                    allowedExtensions: IMAGE_EXTENSIONS,
                    maxBytes: 8 * 1024 * 1024,
                    label: "Image de story",
                  })
                }
              />
            </label>

            <label className="profile-upload-card">
              Vidéo de story
              {storyVideoPreview ? (
                <video className="profile-story-media-preview" src={storyVideoPreview} controls muted />
              ) : (
                <div className="profile-upload-placeholder">Aperçu vidéo</div>
              )}
              <input
                type="file"
                accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                onChange={(e) =>
                  handleFileChange(e, setStoryVideoFile, {
                    allowedMimeTypes: VIDEO_MIME_TYPES,
                    allowedExtensions: VIDEO_EXTENSIONS,
                    maxBytes: 25 * 1024 * 1024,
                    label: "Vidéo de story",
                  })
                }
              />
            </label>
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
              Se déconnecter
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Profile;
