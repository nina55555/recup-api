import React, { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const cardElementOptions = {
  style: {
    base: {
      fontSize: "15px",
      color: "#20202a",
      "::placeholder": { color: "#8d8a7a" },
    },
    invalid: {
      color: "#bf2f2f",
    },
  },
};

function StripeSetupForm({
  requiresCard,
  setupIntentClientSecret,
  consentText,
  userEmail,
  onCompleted,
  onCancel,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const buttonLabel = requiresCard ? "J'accepte et j'enregistre ma carte" : "J'accepte et je continue";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!accepted) {
      setErrorMessage("Vous devez accepter la clause de debit automatique.");
      return;
    }

    if (!requiresCard) {
      await onCompleted({ setupIntentId: null, acceptedTermsText: consentText });
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage("Stripe n'est pas encore pret. Reessayez dans quelques secondes.");
      return;
    }

    if (!setupIntentClientSecret) {
      setErrorMessage("Client secret Stripe introuvable.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Champ carte introuvable.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await stripe.confirmCardSetup(setupIntentClientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: userEmail || undefined,
          },
        },
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Impossible d'enregistrer la carte.");
        return;
      }

      if (!result.setupIntent?.id) {
        setErrorMessage("Reponse Stripe invalide.");
        return;
      }

      await onCompleted({
        setupIntentId: result.setupIntent.id,
        acceptedTermsText: consentText,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="stripe-consent-text">{consentText}</p>

      <label className="stripe-consent-checkbox">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        <span>Je comprends et j'accepte cette condition.</span>
      </label>

      {requiresCard && (
        <div className="stripe-card-wrapper">
          <CardElement options={cardElementOptions} />
        </div>
      )}

      {errorMessage ? <p className="stripe-error">{errorMessage}</p> : null}

      <button type="submit" className="stripe-pay" disabled={submitting || (requiresCard && !stripe)}>
        {submitting ? "Traitement..." : buttonLabel}
      </button>

      <button type="button" className="stripe-cancel" onClick={onCancel} disabled={submitting}>
        Annuler
      </button>
    </form>
  );
}

const StripePayment = ({
  requiresCard,
  setupIntentClientSecret,
  consentText,
  userEmail,
  onCompleted,
  onCancel,
}) => {
  const options = useMemo(() => ({ locale: "fr" }), []);

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeSetupForm
        requiresCard={requiresCard}
        setupIntentClientSecret={setupIntentClientSecret}
        consentText={consentText}
        userEmail={userEmail}
        onCompleted={onCompleted}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePayment;
