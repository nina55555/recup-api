import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from "../lib/supabase";
import {
  issueSmsOtp,
  maskPhoneNumber,
  normalizePhoneNumber,
  verifySmsOtp,
} from "../lib/otpAuth";
import "react-toastify/dist/ReactToastify.css";
import "../css/Auth.css";

const COUNTRY_OPTIONS = [
  "France",
  "Italie",
  "Espagne",
  "Allemagne",
  "Belgique",
  "Suisse",
  "Canada",
  "USA",
  "Japon",
];

const Signup = ({ initialMode = "signup" }) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [story, setStory] = useState("");
  const [storyMode, setStoryMode] = useState("later");
  const [resetPassword, setResetPassword] = useState("");
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpContext, setOtpContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showWaitingPopup, setShowWaitingPopup] = useState(false);
  const recoveryFlowRef = useRef(false);

  useEffect(() => {
    setMode(initialMode);
    setOtpContext(null);
    setOtpCode("");
  }, [initialMode]);

  useEffect(() => {
    recoveryFlowRef.current = isRecoveryFlow;
  }, [isRecoveryFlow]);

  const handleSignup = async () => {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      setErrorMessage("Numero de telephone invalide.");
      toast.error("Numero de telephone invalide.");
      return;
    }

    const waitingEmail = email.trim().toLowerCase();
    const addToWaitingList = async () => {
      await supabase.from("waiting_list").upsert(
        [
          {
            email: waitingEmail,
            source: "signup_submit",
          },
        ],
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      );
    };

    const { data, error: signupError } = await supabase.auth.signUp({
      email: waitingEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });

    if (signupError) {
      const message = (signupError.message || "").toLowerCase();
      const isEmailRateExceeded =
        message.includes("email rate limit exceeded") ||
        message.includes("email rate exceeded") ||
        message.includes("over_email_send_rate_limit");

      if (isEmailRateExceeded) {
        await addToWaitingList();
        setShowWaitingPopup(true);
        toast.info("Inscription a la waiting list confirmee.");
        return;
      }

      setErrorMessage(signupError.message);
      toast.error(signupError.message);
      return;
    }

    if (data?.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          pseudo,
          country,
          story: story || "",
          phone: normalizedPhone,
        },
      ]);

      if (profileError) {
        console.error(profileError);
        setErrorMessage("Erreur creation profil");
        toast.error("Erreur creation profil");
        return;
      }

      await addToWaitingList();

      setShowWaitingPopup(true);
      toast.success("Compte cree. Verifiez votre email.");
    }
  };

  const startLoginOtp = async () => {
    const loginEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
      return;
    }

    if (!data?.user) {
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      setErrorMessage("Impossible de recuperer le numero OTP.");
      toast.error("Impossible de recuperer le numero OTP.");
      return;
    }

    const otpPhone = normalizePhoneNumber(profileData?.phone || "");
    if (!otpPhone) {
      setOtpContext(null);
      setOtpCode("");
      toast.info("Connexion effectuee. Ajoutez un numero SMS dans votre profil pour activer l'OTP.");
      navigate("/");
      return;
    }

    const otpData = await issueSmsOtp({
      purpose: "login",
      phone: otpPhone,
      userId: data.user.id,
    }).catch(async (otpError) => {
      await supabase.auth.signOut();
      setErrorMessage(otpError.message || "Envoi OTP impossible.");
      toast.error(otpError.message || "Envoi OTP impossible.");
      return null;
    });

    if (!otpData?.challengeId) {
      return;
    }

    if (otpData?.debugCode) {
      toast.info(`OTP dev: ${otpData.debugCode}`);
    }

    await supabase.auth.signOut();
    setOtpContext({
      challengeId: otpData.challengeId,
      phone: otpPhone,
      email: loginEmail,
      password,
    });
    setOtpCode("");
    toast.success(
      `Code OTP envoye au ${otpData.maskedPhone || maskPhoneNumber(otpPhone)}.`
    );
  };

  const verifyLoginOtp = async () => {
    if (!otpContext?.challengeId) {
      setErrorMessage("Session OTP invalide.");
      toast.error("Session OTP invalide.");
      return;
    }

    if (!otpCode.trim()) {
      setErrorMessage("Entrez le code OTP.");
      toast.error("Entrez le code OTP.");
      return;
    }

    const verifiedData = await verifySmsOtp({
      challengeId: otpContext.challengeId,
      code: otpCode.trim(),
    }).catch((verifyError) => {
      setErrorMessage(verifyError.message || "Code OTP invalide.");
      toast.error(verifyError.message || "Code OTP invalide.");
      return null;
    });

    if (!verifiedData?.verified) {
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: otpContext.email,
      password: otpContext.password,
    });

    if (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
      return;
    }

    if (data?.user && data?.session) {
      setOtpContext(null);
      setOtpCode("");
      toast.success("Connexion reussie.");
      navigate("/");
    }
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (mode === "reset") {
        if (!resetPassword || resetPassword.length < 6) {
          setErrorMessage("Le mot de passe doit contenir au moins 6 caracteres.");
          toast.error("Le mot de passe doit contenir au moins 6 caracteres.");
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: resetPassword,
        });

        if (error) {
          const message =
            error.message?.toLowerCase().includes("jwt")
              ? "Lien de reinitialisation invalide ou expire. Demandez un nouveau lien."
              : error.message || "Impossible de changer le mot de passe.";
          setErrorMessage(message);
          toast.error(message);
          return;
        }

        setResetPassword("");
        setIsRecoveryFlow(false);
        recoveryFlowRef.current = false;
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode("login");
        toast.success("Mot de passe mis a jour. Connectez-vous.");
        return;
      }

      if (mode === "signup") {
        await handleSignup();
        return;
      }

      if (otpContext) {
        await verifyLoginOtp();
        return;
      }

      await startLoginOtp();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const detectRecoveryFromUrl = async () => {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const searchParams = new URLSearchParams(search);
      const hasRecoveryCode = Boolean(searchParams.get("code"));
      const isRecoveryLink =
        hash.includes("type=recovery") ||
        search.includes("type=recovery") ||
        searchParams.get("type") === "recovery" ||
        searchParams.has("token_hash");

      if (hasRecoveryCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(searchParams.get("code"));
        if (error) {
          toast.error("Lien de recuperation invalide ou expire.");
          return;
        }
      }

      if (isRecoveryLink || hasRecoveryCode) {
        setIsRecoveryFlow(true);
        recoveryFlowRef.current = true;
        setMode("reset");
        setOtpContext(null);
        setOtpCode("");
        toast.info("Lien valide. Choisissez un nouveau mot de passe.");
      }
    };

    detectRecoveryFromUrl();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryFlow(true);
        recoveryFlowRef.current = true;
        setMode("reset");
        setOtpContext(null);
        setOtpCode("");
        return;
      }

      if (event === "SIGNED_IN") {
        if (recoveryFlowRef.current) return;
        navigate("/");
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="auth-container">
      {showWaitingPopup && mode === "signup" && (
        <div className="waiting-popup-overlay">
          <div className="waiting-popup-card">
            <button
              type="button"
              className="waiting-popup-close"
              onClick={() => {
                setShowWaitingPopup(false);
              }}
            >
              x
            </button>
            <h3>Waiting list</h3>
            <p>
              Votre compte est cree, vous etes sur la liste en attente du lancement des encheres.
            </p>
            <button
              type="button"
              className="waiting-popup-ack"
              onClick={() => setShowWaitingPopup(false)}
            >
              Compris
            </button>
          </div>
        </div>
      )}

      <h2>
        {mode === "signup"
          ? "Creer un compte"
          : mode === "reset"
            ? "Nouveau mot de passe"
            : "Se connecter"}
      </h2>

      <form onSubmit={handleAuth} className="auth-form">
        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Pseudo"
              value={pseudo}
              onChange={(event) => setPseudo(event.target.value)}
              required
            />

            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              required
            >
              <option value="">Choisir un pays</option>
              {COUNTRY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <input
              type="tel"
              placeholder="Telephone (+33...)"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </>
        )}

        {!otpContext && (
          <>
            {mode !== "reset" ? (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </>
            ) : (
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                required
              />
            )}
          </>
        )}

        {mode === "login" && otpContext && (
          <input
            type="text"
            placeholder={`Code OTP (${maskPhoneNumber(otpContext.phone)})`}
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value.replace(/[^\d]/g, ""))}
            maxLength={6}
            required
          />
        )}

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
                onChange={(event) => setStory(event.target.value)}
              />
            )}
          </div>
        )}

        <p className="auth-legal">
          En continuant, vous acceptez les <a href="/cgv">CGV</a>.
        </p>

        <button type="submit" disabled={loading}>
          {loading
            ? mode === "signup"
              ? "Creation..."
              : mode === "reset"
                ? "Mise a jour..."
                : "Connexion..."
            : mode === "signup"
              ? "Creer le compte"
              : mode === "reset"
                ? "Enregistrer le nouveau mot de passe"
              : otpContext
                ? "Valider OTP"
                : "Se connecter"}
        </button>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        {mode !== "reset" && (
          <button
            type="button"
            className="auth-toggle"
            onClick={() => {
              setErrorMessage("");
              setOtpContext(null);
              setOtpCode("");
              setMode((prevMode) => (prevMode === "signup" ? "login" : "signup"));
            }}
          >
            {mode === "signup"
              ? "Deja un compte ? Se connecter"
              : "Pas de compte ? S'inscrire"}
          </button>
        )}

        {mode === "reset" && (
          <button
            type="button"
            className="auth-toggle"
            onClick={() => {
              setIsRecoveryFlow(false);
              recoveryFlowRef.current = false;
              setResetPassword("");
              window.history.replaceState({}, document.title, window.location.pathname);
              setMode("login");
            }}
          >
            Retour a la connexion
          </button>
        )}

        {mode === "login" && otpContext && (
          <button
            type="button"
            className="auth-toggle"
            onClick={() => {
              setOtpContext(null);
              setOtpCode("");
            }}
          >
            Retour a la connexion
          </button>
        )}
      </form>

      <ToastContainer />
    </div>
  );
};

export default Signup;
