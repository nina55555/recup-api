import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Auth.css";

const Signup = ({ initialMode = "signup" }) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [story, setStory] = useState("");
  const [storyMode, setStoryMode] = useState("later");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (mode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "http://localhost:5173",
          },
        });

        if (signupError) {
          setErrorMessage(signupError.message);
          toast.error(signupError.message);
          return;
        }

        if (data?.user) {
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: data.user.id,
              pseudo,
              story: story || "",
            },
          ]);

          if (profileError) {
            console.error(profileError);
            setErrorMessage("Erreur création profil");
            toast.error("Erreur création profil");
            return;
          }

          toast.success("Compte créé ! Vérifie ton email.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
          return;
        }

        if (data?.user && data?.session) {
          toast.success("Connexion réussie !");
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="auth-container">
      <h2>{mode === "signup" ? "Créer un compte" : "Se connecter"}</h2>

      <form onSubmit={handleAuth} className="auth-form">
        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
            />

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option value="">Choisir un pays</option>
              <option>France</option>
              <option>Italie</option>
              <option>Espagne</option>
              <option>Allemagne</option>
              <option>Belgique</option>
              <option>Suisse</option>
              <option>Canada</option>
              <option>USA</option>
              <option>Japon</option>
            </select>
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mode === "signup" && (
          <div className="story-section">
            <label>Raconte ton histoire</label>

            <div className="story-options">
              <label>
                <input
                  type="radio"
                  value="now"
                  checked={storyMode === "now"}
                  onChange={() => setStoryMode("now")}
                />
                Maintenant
              </label>

              <label>
                <input
                  type="radio"
                  value="later"
                  checked={storyMode === "later"}
                  onChange={() => setStoryMode("later")}
                />
                Plus tard
              </label>
            </div>

            {storyMode === "now" && (
              <textarea
                placeholder="Ton histoire..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
              />
            )}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? mode === "signup"
              ? "Création..."
              : "Connexion..."
            : mode === "signup"
              ? "Créer le compte"
              : "Se connecter"}
        </button>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <button
          type="button"
          className="auth-toggle"
          onClick={() => {
            setErrorMessage("");
            setMode((prevMode) => (prevMode === "signup" ? "login" : "signup"));
          }}
        >
          {mode === "signup"
            ? "Déjà un compte ? Se connecter"
            : "Pas de compte ? S’inscrire"}
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default Signup;
