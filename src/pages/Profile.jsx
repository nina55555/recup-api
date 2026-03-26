import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import "../css/Profile.css";
import "react-toastify/dist/ReactToastify.css";

const EMPTY_PROFILE = {
  pseudo: "",
  story: "",
  email: "",
  password: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [currentStory, setCurrentStory] = useState("");

  useEffect(() => {
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
          .select("id, pseudo, story")
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
            })
            .select("id, pseudo, story")
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
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    try {
      const profileError = await saveProfileRow({
        pseudo: formData.pseudo,
        story: formData.story,
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
          console.error("Erreur mise a jour auth :", authError);
          toast.error(authError.message);
          return;
        }

        if (data?.user) {
          setUser(data.user);
        }
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
