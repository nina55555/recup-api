import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Auth.css";

const Signup = () => {
  const navigate = useNavigate();

  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [story, setStory] = useState("");
  const [storyMode, setStoryMode] = useState("later");

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173",
        data: { pseudo }
      }
    });

    setLoading(false);

    if (signupError) {
      toast.error(signupError.message);
      return;
    }

    if (data?.user) {
      toast.success("Compte créé ! Vérifiez votre email.");
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          navigate("/home");
        }
      }
    );
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="auth-container">
      <h2>Créer un compte</h2>

      <form onSubmit={handleSignup} className="auth-form">
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
              Raconter maintenant
            </label>

            <label>
              <input
                type="radio"
                value="later"
                checked={storyMode === "later"}
                onChange={() => setStoryMode("later")}
              />
              Raconter plus tard
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

        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer le compte"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Signup;