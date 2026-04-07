import { supabase } from "./supabase";

const parseFunctionError = async (error, fallbackMessage) => {
  if (!error) return fallbackMessage;

  const rawMessage = String(error?.message || "");
  if (
    rawMessage.includes("FunctionsHttpError") ||
    rawMessage.includes("401") ||
    rawMessage.toLowerCase().includes("unauthorized")
  ) {
    return "OTP indisponible (401). Verifiez que la fonction sms-otp est deployee avec --no-verify-jwt.";
  }

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
    // ignore parse errors and fallback to default message
  }

  return error.message || fallbackMessage;
};

export const normalizePhoneNumber = (value) => {
  const raw = (value || "").trim();
  if (!raw) return "";

  let normalized = raw.replace(/[^\d+]/g, "");
  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  }
  if (!normalized.startsWith("+")) {
    normalized = `+${normalized}`;
  }

  const digits = normalized.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return "";
  }

  return `+${digits}`;
};

export const maskPhoneNumber = (value) => {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return "";
  const digits = normalized.slice(1);
  if (digits.length <= 4) return normalized;
  return `+${digits.slice(0, 2)}******${digits.slice(-2)}`;
};

export const issueSmsOtp = async (payload) => {
  const { data, error } = await supabase.functions.invoke("sms-otp", {
    body: {
      action: "issue",
      ...payload,
    },
  });

  if (error) {
    throw new Error(await parseFunctionError(error, "Erreur envoi OTP."));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};

export const verifySmsOtp = async ({ challengeId, code }) => {
  const { data, error } = await supabase.functions.invoke("sms-otp", {
    body: {
      action: "verify",
      challengeId,
      code,
    },
  });

  if (error) {
    throw new Error(await parseFunctionError(error, "Erreur verification OTP."));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};
