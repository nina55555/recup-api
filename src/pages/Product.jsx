import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Countdown from "../components/Countdown";
import Icons from "../components/Icons";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Product.css";
import Enchere from "../components/Enchere.jsx";
import StripePayment from "../components/StripePayment";
import {
  issueSmsOtp,
  maskPhoneNumber,
  normalizePhoneNumber,
  verifySmsOtp,
} from "../lib/otpAuth";
import { getBidderPaymentStatus, saveBidderConsent } from "../lib/stripePayments";

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

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showStripePopup, setShowStripePopup] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [recoveryType, setRecoveryType] = useState("password");
  const [otpCode, setOtpCode] = useState("");
  const [otpContext, setOtpContext] = useState(null);
  const [pendingBidValue, setPendingBidValue] = useState(null);
  const [bidValue, setBidValue] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [formData, setFormData] = useState({
    message: "",
  });
  const [authForm, setAuthForm] = useState({
    pseudo: "",
    country: "",
    story: "",
    email: "",
    password: "",
    phone: "",
  });
  const [bids, setBids] = useState([]);
  const [user, setUser] = useState(null);
  const [bidderProfile, setBidderProfile] = useState(null);
  const [countdownDone, setCountdownDone] = useState(false);
  const [didShowSessionToast, setDidShowSessionToast] = useState(false);

  const clearRecoveryParamsFromUrl = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const ensureActiveSession = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Erreur session Supabase :", sessionError);
      return null;
    }

    if (!session?.access_token) {
      return null;
    }

    return session;
  };

  const getMediaUrl = (path) => {
    if (!path) return "";
    return supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
  };

  const loadProfileForUser = async (userId) => {
    if (!userId) return null;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, pseudo, country, story, phone")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erreur chargement profil enchere :", profileError);
      return null;
    }

    setBidderProfile(profile);
    return profile;
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
          profilesById = Object.fromEntries(
            profileRows.map((profile) => [profile.id, profile])
          );
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
        if (error?.name !== "AbortError" && error?.name !== "AuthSessionMissingError" && error) {
          console.error("Erreur recuperation user :", error);
        }

        if (data?.user) {
          setUser(data.user);
          await loadProfileForUser(data.user.id);
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
        const { data: idsData, error: idsError } = await supabase
          .from("models")
          .select("id")
          .order("created_at", { ascending: false });

        if (idsError) {
          console.error("Erreur chargement liste produits:", idsError);
        } else {
          setProductIds((idsData || []).map((item) => item.id));
        }

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

  useEffect(() => {
    setCountdownDone(false);
  }, [id, product?.auction_end_at]);

  useEffect(() => {
    const detectRecoveryLink = async () => {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const searchParams = new URLSearchParams(search);
      const isRecoveryLink =
        hash.includes("type=recovery") ||
        search.includes("type=recovery") ||
        searchParams.get("type") === "recovery" ||
        searchParams.has("token_hash");
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error("Lien de reinitialisation invalide ou expire.");
          return;
        }
      }

      if (isRecoveryLink || code) {
        setShowAuthPopup(true);
        setAuthMode("reset");
        setOtpContext(null);
        setOtpCode("");
        setResetPassword("");
        toast.info("Choisissez un nouveau mot de passe pour finaliser la recuperation.");
      }
    };

    detectRecoveryLink();
  }, []);

  const isAuctionExpired = () => {
    const endAt = product?.auction_end_at;
    if (!endAt) return false;
    const target = new Date(endAt).getTime();
    if (Number.isNaN(target)) return false;
    return Date.now() >= target;
  };

  const startBidMessageFlow = (value) => {
    setBidValue(value);
    setShowPopup(true);
  };

  const prepareStripeForBid = async (value) => {
    setStripeLoading(true);
    try {
      const status = await getBidderPaymentStatus({ productId: id });
      if (status?.hasPaymentMethod && status?.hasAcceptedTerms) {
        startBidMessageFlow(value);
        return;
      }

      setPendingBidValue(value);
      setStripeStatus(status || null);
      setShowStripePopup(true);
    } catch (error) {
      const message = error.message || "Impossible de preparer Stripe.";
      const isEdgeUnavailable =
        message.includes("Edge Function injoignable") ||
        message.toLowerCase().includes("failed to send a request to the edge function");

      if (isEdgeUnavailable) {
        toast.warning(
          "Service Stripe temporairement injoignable: enchere autorisee sans pre-enregistrement carte."
        );
        startBidMessageFlow(value);
        return;
      }

      toast.error(message);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleBidSubmit = async (value) => {
    if (isAuctionExpired() || countdownDone) {
      toast.error("Cette enchere est terminee.");
      return;
    }

    const activeSession = await ensureActiveSession();
    if (!user || !activeSession) {
      setUser(null);
      setPendingBidValue(value);
      setAuthMode("login");
      setShowAuthPopup(true);
      if (!didShowSessionToast) {
        toast.info("Session expiree. Reconnectez-vous pour encherir.");
        setDidShowSessionToast(true);
      }
      return;
    }

    setDidShowSessionToast(false);

    await prepareStripeForBid(value);
  };

  const handleStripeCompleted = async ({ setupIntentId, acceptedTermsText }) => {
    const bidAmount = pendingBidValue;
    if (!bidAmount) {
      toast.error("Montant d'enchere introuvable. Reessayez.");
      return;
    }

    try {
      await saveBidderConsent({
        productId: id,
        bidAmount,
        statementText: acceptedTermsText,
        setupIntentId: setupIntentId || null,
      });

      setShowStripePopup(false);
      setStripeStatus(null);
      setPendingBidValue(null);
      startBidMessageFlow(bidAmount);
      toast.success("Moyen de paiement valide. Vous pouvez confirmer votre enchere.");
    } catch (error) {
      toast.error(error.message || "Consentement Stripe impossible.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthFormChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const startOtpFlow = async (payload) => {
    const otpData = await issueSmsOtp(payload);
    if (otpData?.debugCode) {
      toast.info(`OTP dev: ${otpData.debugCode}`);
    }
    return otpData;
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    if (authMode === "reset") {
      if (!resetPassword || resetPassword.length < 6) {
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
        toast.error(message);
        return;
      }

      clearRecoveryParamsFromUrl();
      setResetPassword("");
      setAuthMode("login");
      toast.success("Mot de passe mis a jour. Vous pouvez vous reconnecter.");
      return;
    }

    if (authMode === "otp") {
      if (!otpContext?.challengeId) {
        toast.error("Session OTP invalide.");
        setAuthMode("login");
        return;
      }

      if (!otpCode.trim()) {
        toast.error("Renseignez le code OTP recu par SMS.");
        return;
      }

      const verifiedData = await verifySmsOtp({
        challengeId: otpContext.challengeId,
        code: otpCode.trim(),
      }).catch((error) => {
        toast.error(error.message || "Verification OTP impossible.");
        return null;
      });

      if (!verifiedData?.verified) {
        return;
      }

      if (otpContext.purpose === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: otpContext.email,
          password: otpContext.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data?.user) {
          await supabase.auth.refreshSession().catch(() => null);
          setUser(data.user);
          await loadProfileForUser(data.user.id);
          setDidShowSessionToast(false);
          setShowAuthPopup(false);
          setOtpContext(null);
          setOtpCode("");

          if (pendingBidValue) {
            const queuedBid = pendingBidValue;
            setPendingBidValue(null);
            await prepareStripeForBid(queuedBid);
          }
        }

        return;
      }

      if (otpContext.purpose === "recover_password") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          otpContext.email,
          {
            redirectTo: `${window.location.origin}${window.location.pathname}`,
          }
        );

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Lien de reinitialisation envoye par email.");
        setAuthMode("login");
        setOtpContext(null);
        setOtpCode("");
        return;
      }

      if (otpContext.purpose === "recover_email") {
        if (verifiedData?.recoveredEmail) {
          toast.success(`Email retrouve: ${verifiedData.recoveredEmail}`);
        } else {
          toast.success("Compte verifie. Contactez le support pour recuperer l'email.");
        }

        setAuthMode("login");
        setOtpContext(null);
        setOtpCode("");
      }

      return;
    }

    if (authMode === "recover") {
      if (recoveryType === "password") {
        if (!authForm.email || !authForm.phone) {
          toast.error("Renseignez email et telephone.");
          return;
        }

        const phone = normalizePhoneNumber(authForm.phone);
        if (!phone) {
          toast.error("Numero de telephone invalide.");
          return;
        }

        const otpData = await startOtpFlow({
          purpose: "recover_password",
          phone,
          targetEmail: authForm.email.trim().toLowerCase(),
        }).catch((error) => {
          toast.error(error.message || "Envoi OTP impossible.");
          return null;
        });

        if (!otpData?.challengeId) {
          return;
        }

        setOtpCode("");
        setOtpContext({
          purpose: "recover_password",
          challengeId: otpData.challengeId,
          phone,
          email: authForm.email.trim().toLowerCase(),
        });
        setAuthMode("otp");
        toast.success(`Code OTP envoye au ${otpData.maskedPhone || maskPhoneNumber(phone)}.`);
        return;
      }

      const pseudoValue = authForm.pseudo.trim();
      if (!pseudoValue || !authForm.country || !authForm.phone) {
        toast.error("Renseignez pseudo, pays et telephone.");
        return;
      }

      const phone = normalizePhoneNumber(authForm.phone);
      if (!phone) {
        toast.error("Numero de telephone invalide.");
        return;
      }

      const otpData = await startOtpFlow({
        purpose: "recover_email",
        phone,
        pseudo: pseudoValue,
        country: authForm.country,
      }).catch((error) => {
        toast.error(error.message || "Envoi OTP impossible.");
        return null;
      });

      if (!otpData?.challengeId) {
        return;
      }

      setOtpCode("");
      setOtpContext({
        purpose: "recover_email",
        challengeId: otpData.challengeId,
        phone,
      });
      setAuthMode("otp");
      toast.success(`Code OTP envoye au ${otpData.maskedPhone || maskPhoneNumber(phone)}.`);
      return;
    }

    if (authMode === "signup") {
      const normalizedSignupPhone = normalizePhoneNumber(authForm.phone);
      if (!normalizedSignupPhone) {
        toast.error("Numero de telephone invalide.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          emailRedirectTo: "http://localhost:5173",
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          pseudo: authForm.pseudo,
          country: authForm.country,
          story: authForm.story || "",
          phone: normalizedSignupPhone,
        });

        if (profileError) {
          toast.error(profileError.message || "Erreur creation profil");
          return;
        }

        toast.success("Compte cree. Verifiez votre email puis connectez-vous.");
        setAuthMode("login");
      }

      return;
    }

    const loginEmail = authForm.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: authForm.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data?.user) {
      const profile = await loadProfileForUser(data.user.id);
      setDidShowSessionToast(false);
      const profilePhone = normalizePhoneNumber(profile?.phone || "");
      if (!profilePhone) {
        setUser(data.user);
        setShowAuthPopup(false);
        toast.info("Connexion effectuee. Ajoutez un numero SMS dans votre profil pour activer l'OTP.");
        if (pendingBidValue) {
          const queuedBid = pendingBidValue;
          setPendingBidValue(null);
          await prepareStripeForBid(queuedBid);
        }
        return;
      }

      const otpData = await startOtpFlow({
        purpose: "login",
        phone: profilePhone,
        userId: data.user.id,
      }).catch(async (otpError) => {
        await supabase.auth.signOut();
        toast.error(otpError.message || "OTP indisponible.");
        return null;
      });

      if (!otpData?.challengeId) return;

      await supabase.auth.signOut();
      setOtpContext({
        purpose: "login",
        challengeId: otpData.challengeId,
        phone: profilePhone,
        email: loginEmail,
        password: authForm.password,
      });
      setOtpCode("");
      setAuthMode("otp");
      toast.success(`Code OTP envoye au ${otpData.maskedPhone || maskPhoneNumber(profilePhone)}.`);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const activeSession = await ensureActiveSession();
    if (!activeSession) {
      setShowPopup(false);
      setAuthMode("login");
      setShowAuthPopup(true);
      toast.info("Session expiree. Reconnectez-vous pour valider l'enchere.");
      return;
    }

    if (bidValue === null || bidValue === undefined) {
      toast.error("Montant d'enchere manquant.");
      return;
    }

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
        accepted_auto_debit_terms: true,
        auto_debit_percentage: 50,
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
    setBidValue(null);
  };

  const currentIndex = productIds.findIndex((productId) => productId === id);
  const previousProductId =
    currentIndex > -1
      ? productIds[(currentIndex - 1 + productIds.length) % productIds.length]
      : null;
  const nextProductId =
    currentIndex > -1 ? productIds[(currentIndex + 1) % productIds.length] : null;

  if (loading) return <div>Chargement...</div>;
  if (!product) return <div>Produit introuvable</div>;

  return (
    <div className="main--box">
      <Countdown
        endAt={product.auction_end_at}
        onComplete={() => {
          setCountdownDone(true);
        }}
      />

      <div className="big--box">
        <div className="images--box">
          <img className="paint" src="../src/assets/wallpaint.jpg" />

          {previousProductId && (
            <button
              type="button"
              className="podium-nav-arrow podium-nav-left"
              onClick={() => navigate(`/product/${previousProductId}`)}
              aria-label="Produit precedent"
            >
              ‹
            </button>
          )}

          {nextProductId && (
            <button
              type="button"
              className="podium-nav-arrow podium-nav-right"
              onClick={() => navigate(`/product/${nextProductId}`)}
              aria-label="Produit suivant"
            >
              ›
            </button>
          )}

          <div className="product-overlay">
            <img className="podium" src={product.image_url} />
            <h2>{product.title}</h2>
          </div>
        </div>
      </div>

      <Enchere onBidSubmit={handleBidSubmit} bids={bids} />

      <Icons />
      {stripeLoading ? <p className="auth-otp-hint">Preparation du paiement securise...</p> : null}

      {showStripePopup && (
        <div className="popup-overlay">
          <div className="stripe-popup">
            <h2>Verification paiement</h2>
            <StripePayment
              requiresCard={!stripeStatus?.hasPaymentMethod}
              setupIntentClientSecret={stripeStatus?.setupIntentClientSecret || ""}
              consentText={
                stripeStatus?.consentText ||
                "En encherissant vous acceptez d'etre debite automatiquement de 50% du montant de votre mise si vous remportez l'enchere. Les 50% restants seront a regler en direct lors du rendez-vous essayage."
              }
              userEmail={user?.email || ""}
              onCompleted={handleStripeCompleted}
              onCancel={() => {
                setShowStripePopup(false);
                setStripeStatus(null);
              }}
            />
          </div>
        </div>
      )}

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
            <h3>Votre message</h3>

            <form onSubmit={handleFormSubmit}>
              <textarea
                name="message"
                placeholder="(optionnel)"
                value={formData.message}
                onChange={handleChange}
              />

              <button type="submit">Valider l'enchere</button>
            </form>
          </div>
        </div>
      )}

      {showAuthPopup && (
        <div className="popup-overlay">
          <div className="popup-form popup-auth-form">
            <button
              type="button"
              className="product-popup-close"
              onClick={() => {
                setShowAuthPopup(false);
                clearRecoveryParamsFromUrl();
                setAuthMode("login");
                setOtpContext(null);
                setOtpCode("");
                setResetPassword("");
              }}
              aria-label="Fermer"
            >
              x
            </button>
            <h3>
              {authMode === "signup"
                ? "Creer un compte"
                : authMode === "reset"
                  ? "Nouveau mot de passe"
                : authMode === "otp"
                  ? "Verification SMS"
                : authMode === "recover"
                  ? "Recuperation compte"
                  : "Se connecter"}
            </h3>

            <form onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <>
                  <input
                    type="text"
                    name="pseudo"
                    placeholder="Pseudo"
                    value={authForm.pseudo}
                    onChange={handleAuthFormChange}
                    required
                  />
                  <select
                    name="country"
                    value={authForm.country}
                    onChange={handleAuthFormChange}
                    required
                  >
                    <option value="">Choisir un pays</option>
                    {COUNTRY_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="story"
                    placeholder="Votre histoire (optionnel)"
                    value={authForm.story}
                    onChange={handleAuthFormChange}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telephone (+33...)"
                    value={authForm.phone}
                    onChange={handleAuthFormChange}
                    required
                  />
                </>
              )}

              {authMode === "recover" && (
                <>
                  <div className="auth-inline-links">
                    <button
                      type="button"
                      className={`auth-inline-switch ${recoveryType === "password" ? "is-active" : ""}`}
                      onClick={() => setRecoveryType("password")}
                    >
                      Mot de passe perdu
                    </button>
                    <button
                      type="button"
                      className={`auth-inline-switch ${recoveryType === "email" ? "is-active" : ""}`}
                      onClick={() => setRecoveryType("email")}
                    >
                      Email perdu
                    </button>
                  </div>

                  {recoveryType === "email" ? (
                    <>
                      <input
                        type="text"
                        name="pseudo"
                        placeholder="Pseudo"
                        value={authForm.pseudo}
                        onChange={handleAuthFormChange}
                        required
                      />
                      <select
                        name="country"
                        value={authForm.country}
                        onChange={handleAuthFormChange}
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
                        name="phone"
                        placeholder="Telephone (+33...)"
                        value={authForm.phone}
                        onChange={handleAuthFormChange}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={authForm.email}
                        onChange={handleAuthFormChange}
                        required
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Telephone (+33...)"
                        value={authForm.phone}
                        onChange={handleAuthFormChange}
                        required
                      />
                    </>
                  )}
                </>
              )}

              {authMode === "otp" && (
                <>
                  <p className="auth-otp-hint">
                    Entrez le code recu par SMS {otpContext?.phone ? `(${maskPhoneNumber(otpContext.phone)})` : ""}.
                  </p>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Code OTP (6 chiffres)"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/[^\d]/g, ""))}
                    maxLength={6}
                    required
                  />
                </>
              )}

              {authMode === "reset" && (
                <input
                  type="password"
                  name="resetPassword"
                  placeholder="Nouveau mot de passe"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  required
                />
              )}

              {(authMode === "login" || authMode === "signup") && (
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                    required
                  />
                </>
              )}

              <button type="submit">
                {authMode === "signup"
                  ? "S'inscrire"
                  : authMode === "reset"
                    ? "Enregistrer le nouveau mot de passe"
                  : authMode === "otp"
                    ? "Valider le code"
                  : authMode === "recover"
                    ? recoveryType === "password"
                      ? "Envoyer OTP"
                      : "Lancer verification"
                    : "Connexion"}
              </button>

              {authMode === "otp" ? (
                <button
                  type="button"
                  className="auth-inline-switch"
                  onClick={() => {
                    setAuthMode("login");
                    setOtpContext(null);
                    setOtpCode("");
                  }}
                >
                  Retour a la connexion
                </button>
              ) : authMode === "reset" ? (
                <button
                  type="button"
                  className="auth-inline-switch"
                  onClick={() => {
                    clearRecoveryParamsFromUrl();
                    setResetPassword("");
                    setAuthMode("login");
                  }}
                >
                  Retour a la connexion
                </button>
              ) : authMode !== "recover" ? (
                <>
                  <button
                    type="button"
                    className="auth-inline-switch"
                    onClick={() =>
                      setAuthMode((prev) => (prev === "signup" ? "login" : "signup"))
                    }
                  >
                    {authMode === "signup"
                      ? "Deja un compte ? Se connecter"
                      : "Pas de compte ? S'inscrire"}
                  </button>
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => {
                      setRecoveryType("password");
                      setAuthMode("recover");
                    }}
                  >
                    Email ou mot de passe perdu ?
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="auth-inline-switch"
                  onClick={() => setAuthMode("login")}
                >
                  Retour a la connexion
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Product;
