// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getOrCreateStripeCustomer = async ({
  adminClient,
  stripe,
  userId,
  email,
}: {
  adminClient: ReturnType<typeof createClient>;
  stripe: Stripe;
  userId: string;
  email: string;
}) => {
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.id) throw new Error("Profil utilisateur introuvable.");
  if (profile.stripe_customer_id) return profile.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: { supabase_user_id: userId },
  });

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  if (updateError) throw updateError;
  return customer.id;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

    const missing = [];
    if (!supabaseUrl) missing.push("SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeSecretKey) missing.push("STRIPE_SECRET_KEY");

    if (missing.length > 0) {
      return json(500, {
        error: "Configuration Stripe/Supabase manquante.",
        missing,
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!bearerToken) {
      return json(401, { error: "Session invalide." });
    }

    const { data: authData, error: authError } = await adminClient.auth.getUser(bearerToken);
    if (authError || !authData?.user?.id) {
      return json(401, { error: "Session invalide." });
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || "";
    const payload = await req.json().catch(() => ({}));
    const productId = String(payload?.productId || "");
    const setupIntentId = String(payload?.setupIntentId || "");
    const statementText = String(payload?.statementText || "").trim();
    const bidAmountNumber = Number(payload?.bidAmount);

    if (!productId) return json(400, { error: "productId requis." });
    if (!statementText) return json(400, { error: "Texte de consentement requis." });
    if (!Number.isFinite(bidAmountNumber) || bidAmountNumber <= 0) {
      return json(400, { error: "Montant d'enchere invalide." });
    }

    const { data: product, error: productError } = await adminClient
      .from("models")
      .select("id, auction_end_at")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product?.id) {
      return json(404, { error: "Produit introuvable." });
    }

    if (product.auction_end_at) {
      const endAt = new Date(product.auction_end_at).getTime();
      if (!Number.isNaN(endAt) && Date.now() >= endAt) {
        return json(409, { error: "Cette enchere est terminee." });
      }
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" });
    const customerId = await getOrCreateStripeCustomer({
      adminClient,
      stripe,
      userId,
      email: userEmail,
    });

    if (setupIntentId) {
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      if (!setupIntent?.id) return json(400, { error: "SetupIntent introuvable." });
      if (setupIntent.status !== "succeeded") {
        return json(400, { error: "Carte non confirmee. Reessayez." });
      }
      if (setupIntent.customer !== customerId) {
        return json(403, { error: "SetupIntent non autorise." });
      }
    }

    const customer = await stripe.customers.retrieve(customerId);
    const defaultPmId =
      !customer.deleted && typeof customer.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : "";

    let paymentMethodId = defaultPmId;
    if (!paymentMethodId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
        limit: 1,
      });
      paymentMethodId = paymentMethods.data?.[0]?.id || "";
    }

    if (!paymentMethodId) {
      return json(400, { error: "Aucun moyen de paiement carte disponible." });
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== customerId) {
      return json(403, { error: "Moyen de paiement non autorise." });
    }

    const card = paymentMethod.card;
    const { error: paymentMethodError } = await adminClient.from("bidder_payment_methods").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_payment_method_id: paymentMethodId,
      brand: card?.brand || "",
      last4: card?.last4 || "",
      exp_month: card?.exp_month || null,
      exp_year: card?.exp_year || null,
      is_default: true,
      updated_at: new Date().toISOString(),
    });

    if (paymentMethodError) throw paymentMethodError;

    const { error: consentError } = await adminClient.from("auction_bidder_consents").upsert({
      product_id: productId,
      user_id: userId,
      accepted_terms_text: statementText,
      accepted_at: new Date().toISOString(),
      first_bid_amount: bidAmountNumber,
      setup_intent_id: setupIntentId || null,
    });

    if (consentError) throw consentError;

    return json(200, {
      ok: true,
      hasPaymentMethod: true,
      setupIntentId: setupIntentId || null,
    });
  } catch (error) {
    return json(500, { error: error?.message || "Erreur consentement Stripe." });
  }
});
