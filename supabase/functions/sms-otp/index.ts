// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 45;

type OtpPurpose = "login" | "recover_password" | "recover_email" | "profile_change";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getErrorMessage = (value: unknown, fallback: string) => {
  if (!value) return fallback;
  if (value instanceof Error) return value.message || fallback;
  if (typeof value === "object" && value !== null && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return fallback;
};

const normalizePhone = (value: string) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  let normalized = raw.replace(/[^\d+]/g, "");
  if (normalized.startsWith("00")) normalized = `+${normalized.slice(2)}`;
  if (!normalized.startsWith("+")) normalized = `+${normalized}`;
  const digits = normalized.replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return "";
  return `+${digits}`;
};

const maskPhone = (value: string) => {
  const normalized = normalizePhone(value);
  if (!normalized) return "";
  const digits = normalized.slice(1);
  if (digits.length <= 4) return normalized;
  return `+${digits.slice(0, 2)}******${digits.slice(-2)}`;
};

const randomOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const sha256Hex = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const parsePurpose = (value: string): OtpPurpose | null => {
  if (
    value === "login" ||
    value === "recover_password" ||
    value === "recover_email" ||
    value === "profile_change"
  ) {
    return value;
  }
  return null;
};

const sendTwilioSms = async ({
  accountSid,
  authToken,
  fromPhone,
  toPhone,
  body,
}: {
  accountSid: string;
  authToken: string;
  fromPhone: string;
  toPhone: string;
  body: string;
}) => {
  const params = new URLSearchParams();
  params.set("From", fromPhone);
  params.set("To", toPhone);
  params.set("Body", body);

  const basic = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Twilio SMS refuse (${response.status}) ${message}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const otpSecret = Deno.env.get("OTP_PEPPER") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return json(500, { error: "Configuration Supabase manquante." });
    }

    if (!otpSecret) {
      return json(500, { error: "Variable OTP_PEPPER manquante." });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const payload = await req.json();
    const action = payload?.action;

    if (action === "issue") {
      const purpose = parsePurpose(String(payload?.purpose || ""));
      if (!purpose) {
        return json(400, { error: "purpose invalide." });
      }

      const inputPhone = normalizePhone(String(payload?.phone || ""));
      if (!inputPhone) {
        return json(400, { error: "Numero de telephone invalide." });
      }

      const userId = String(payload?.userId || "");
      const targetEmail = String(payload?.targetEmail || "").trim().toLowerCase();
      const pseudo = String(payload?.pseudo || "").trim();
      const country = String(payload?.country || "").trim();

      let targetUserId = "";
      let expectedPhone = inputPhone;

      if (purpose === "login" || purpose === "profile_change") {
        if (!userId) {
          return json(400, { error: "Utilisateur requis pour cette operation." });
        }

        const { data: profileRow, error: profileError } = await adminClient
          .from("profiles")
          .select("id, phone")
          .eq("id", userId)
          .maybeSingle();

        if (profileError || !profileRow?.id) {
          return json(400, { error: "Profil utilisateur introuvable." });
        }

        const normalizedProfilePhone = normalizePhone(profileRow.phone || "");
        if (!normalizedProfilePhone) {
          return json(400, { error: "Aucun numero SMS configure sur ce compte." });
        }

        expectedPhone = normalizedProfilePhone;
        if (expectedPhone !== inputPhone) {
          return json(403, { error: "Numero non autorise pour ce compte." });
        }

        targetUserId = userId;
      }

      if (purpose === "recover_email") {
        if (!pseudo || !country) {
          return json(400, { error: "Pseudo et pays requis." });
        }

        const { data: profileRows, error: profileError } = await adminClient
          .from("profiles")
          .select("id, phone")
          .ilike("pseudo", pseudo)
          .eq("country", country)
          .limit(3);

        if (profileError || !profileRows?.length) {
          return json(404, { error: "Compte introuvable." });
        }

        const matched = profileRows.find(
          (row) => normalizePhone(row.phone || "") === inputPhone
        );

        if (!matched?.id) {
          return json(404, { error: "Compte introuvable." });
        }

        targetUserId = matched.id;
        expectedPhone = inputPhone;
      }

      if (purpose === "recover_password") {
        if (!targetEmail) {
          return json(400, { error: "Email requis pour la recuperation." });
        }

        const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (usersError) {
          return json(500, { error: usersError.message || "Recherche utilisateur impossible." });
        }

        const authUser = (usersData?.users || []).find(
          (entry) => (entry.email || "").toLowerCase() === targetEmail
        );

        if (!authUser?.id) {
          return json(404, { error: "Compte introuvable." });
        }

        const { data: profileRow, error: profileError } = await adminClient
          .from("profiles")
          .select("id, phone")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profileError || !profileRow?.id) {
          return json(404, { error: "Compte introuvable." });
        }

        const normalizedProfilePhone = normalizePhone(profileRow.phone || "");
        if (!normalizedProfilePhone || normalizedProfilePhone !== inputPhone) {
          return json(403, { error: "Numero SMS incorrect pour ce compte." });
        }

        targetUserId = authUser.id;
        expectedPhone = normalizedProfilePhone;
      }

      const { data: recentRows, error: recentError } = await adminClient
        .from("otp_challenges")
        .select("id, created_at")
        .eq("phone", expectedPhone)
        .eq("purpose", purpose)
        .is("consumed_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentError) {
        return json(500, { error: recentError.message || "Erreur OTP." });
      }

      if (recentRows?.[0]?.created_at) {
        const createdAt = new Date(recentRows[0].created_at).getTime();
        const diffSeconds = Math.floor((Date.now() - createdAt) / 1000);
        if (diffSeconds < OTP_RESEND_SECONDS) {
          return json(429, {
            error: `Patientez ${OTP_RESEND_SECONDS - diffSeconds}s avant un nouvel envoi.`,
          });
        }
      }

      const code = randomOtpCode();
      const codeHash = await sha256Hex(`${code}:${otpSecret}`);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

      const { data: inserted, error: insertError } = await adminClient
        .from("otp_challenges")
        .insert({
          user_id: targetUserId || null,
          purpose,
          phone: expectedPhone,
          target_email: targetEmail || null,
          target_user_id: targetUserId || null,
          pseudo: pseudo || null,
          country: country || null,
          code_hash: codeHash,
          expires_at: expiresAt,
          max_attempts: OTP_MAX_ATTEMPTS,
        })
        .select("id, expires_at")
        .single();

      if (insertError || !inserted?.id) {
        return json(500, { error: insertError?.message || "Creation OTP impossible." });
      }

      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
      const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
      const twilioFrom = Deno.env.get("TWILIO_FROM") || "";
      const debugOtpAllowed = Deno.env.get("OTP_DEV_ALLOW_CONSOLE") === "true";

      const smsBody =
        `Votre code OTP est ${code}. ` +
        `Il expire dans ${OTP_EXPIRY_MINUTES} minutes. ` +
        "Ne le partagez jamais.";

      let smsFallbackWarning = "";
      if (twilioSid && twilioToken && twilioFrom) {
        try {
          await sendTwilioSms({
            accountSid: twilioSid,
            authToken: twilioToken,
            fromPhone: twilioFrom,
            toPhone: expectedPhone,
            body: smsBody,
          });
        } catch (smsError) {
          if (!debugOtpAllowed) {
            throw smsError;
          }
          smsFallbackWarning = getErrorMessage(
            smsError,
            "Echec Twilio (fallback debug)."
          );
        }
      } else if (!debugOtpAllowed) {
        return json(500, {
          error:
            "Provider SMS non configure. Renseignez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_FROM.",
        });
      }

      return json(200, {
        challengeId: inserted.id,
        expiresAt: inserted.expires_at,
        maskedPhone: maskPhone(expectedPhone),
        debugCode: debugOtpAllowed ? code : null,
        warning: smsFallbackWarning,
      });
    }

    if (action === "verify") {
      const challengeId = String(payload?.challengeId || "").trim();
      const otpCode = String(payload?.code || "").trim();

      if (!challengeId || !otpCode) {
        return json(400, { error: "challengeId et code requis." });
      }

      const { data: challenge, error: challengeError } = await adminClient
        .from("otp_challenges")
        .select(
          "id, purpose, code_hash, phone, target_email, target_user_id, expires_at, attempt_count, max_attempts, consumed_at"
        )
        .eq("id", challengeId)
        .maybeSingle();

      if (challengeError || !challenge?.id) {
        return json(404, { error: "OTP introuvable." });
      }

      if (challenge.consumed_at) {
        return json(400, { error: "OTP deja utilise." });
      }

      if (new Date(challenge.expires_at).getTime() < Date.now()) {
        return json(400, { error: "OTP expire." });
      }

      if ((challenge.attempt_count || 0) >= (challenge.max_attempts || OTP_MAX_ATTEMPTS)) {
        return json(400, { error: "Nombre de tentatives depasse." });
      }

      const computedHash = await sha256Hex(`${otpCode}:${otpSecret}`);
      if (computedHash !== challenge.code_hash) {
        await adminClient
          .from("otp_challenges")
          .update({ attempt_count: (challenge.attempt_count || 0) + 1 })
          .eq("id", challenge.id);

        return json(401, { error: "Code OTP invalide." });
      }

      await adminClient
        .from("otp_challenges")
        .update({ verified_at: new Date().toISOString(), consumed_at: new Date().toISOString() })
        .eq("id", challenge.id);

      let recoveredEmail = "";
      if (challenge.purpose === "recover_email" && challenge.target_user_id) {
        const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(
          challenge.target_user_id
        );
        if (!userError) {
          recoveredEmail = userData?.user?.email || "";
        }
      }

      return json(200, {
        verified: true,
        purpose: challenge.purpose,
        maskedPhone: maskPhone(challenge.phone),
        targetEmail: challenge.target_email || "",
        recoveredEmail,
      });
    }

    return json(400, { error: "Action inconnue." });
  } catch (error) {
    return json(500, { error: getErrorMessage(error, "Erreur edge function OTP.") });
  }
});
