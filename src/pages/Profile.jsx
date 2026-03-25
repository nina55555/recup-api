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
        .select("pseudo, story")
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
      });

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    try {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
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

      toast.success("Profil mis à jour.");
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
            Pseudo
            <input
              type="text"
              name="pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              required
            />
          </label>

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
            Histoire
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              placeholder="Votre histoire..."
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
