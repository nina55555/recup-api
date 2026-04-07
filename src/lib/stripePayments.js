import { supabase } from "./supabase";

const parseFunctionError = async (error, fallbackMessage) => {
  if (!error) return fallbackMessage;

  try {
    const response = error.context;
    if (!response || typeof response.clone !== "function") {
      return error.message || fallbackMessage;
    }

    const cloned = response.clone();
    const contentType = cloned.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await cloned.json();
      if (body?.error) return body.error;
      if (body?.message) return body.message;
    }

    const text = await cloned.text();
    if (text) return text;
  } catch (_err) {
    // fallback below
  }

  return error.message || fallbackMessage;
};

const invokeWithSession = async (functionName, body, fallbackMessage) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`${functionName}: Session utilisateur introuvable.`);
  }

  if (!session?.access_token) {
    throw new Error(`${functionName}: Session expiree, reconnectez-vous.`);
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  return { data, error };
};

const invokeStripeFunction = async (functionName, body, fallbackMessage) => {
  let { data, error } = await invokeWithSession(functionName, body, fallbackMessage);

  if (error) {
    const parsed = await parseFunctionError(error, fallbackMessage);
    const isInvalidJwt = String(parsed || "").toLowerCase().includes("invalid jwt");

    if (isInvalidJwt) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError) {
        const retry = await invokeWithSession(functionName, body, fallbackMessage);
        data = retry.data;
        error = retry.error;
      }
    }
  }

  if (error) {
    const parsed = await parseFunctionError(error, fallbackMessage);
    const isTransportError = String(parsed || "")
      .toLowerCase()
      .includes("failed to send a request to the edge function");

    if (isTransportError) {
      throw new Error(
        `${functionName}: Edge Function injoignable (fonction non deployee, URL projet incorrecte, ou reseau bloque).`
      );
    }

    throw new Error(`${functionName}: ${parsed}`);
  }
  if (data?.error) {
    throw new Error(`${functionName}: ${data.error}`);
  }
  return data;
};

export const getBidderPaymentStatus = async ({ productId }) =>
  invokeStripeFunction(
    "stripe-bidder-payment-status",
    { productId },
    "Impossible de recuperer le statut Stripe."
  );

export const saveBidderConsent = async ({ productId, bidAmount, statementText, setupIntentId }) =>
  invokeStripeFunction(
    "stripe-save-bidder-consent",
    { productId, bidAmount, statementText, setupIntentId },
    "Impossible d'enregistrer votre consentement."
  );
