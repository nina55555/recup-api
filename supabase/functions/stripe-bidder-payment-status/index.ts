// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONSENT_TEXT =
  "En encherissant vous acceptez d'etre debite automatiquement de 50% du montant de votre mise si vous remportez l'enchere. Les 50% restants seront a regler en direct lors du rendez-vous essayage.";

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

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

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
    const email = authData.user.email || "";
    const payload = await req.json().catch(() => ({}));
    const productId = String(payload?.productId || "");

    if (!productId) {
      return json(400, { error: "productId requis." });
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

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
    });

    const customerId = await getOrCreateStripeCustomer({
      adminClient,
      stripe,
      userId,
      email,
    });

    const { data: paymentMethodRow } = await adminClient
      .from("bidder_payment_methods")
      .select("stripe_payment_method_id")
      .eq("user_id", userId)
      .maybeSingle();

    const hasPaymentMethod = Boolean(paymentMethodRow?.stripe_payment_method_id);

    const { data: consentRow } = await adminClient
      .from("auction_bidder_consents")
      .select("product_id")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle();

    const hasAcceptedTerms = Boolean(consentRow?.product_id);

    if (hasPaymentMethod) {
      return json(200, {
        hasPaymentMethod: true,
        hasAcceptedTerms,
        setupIntentClientSecret: null,
        consentText: CONSENT_TEXT,
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: {
        supabase_user_id: userId,
        product_id: productId,
      },
    });

    return json(200, {
      hasPaymentMethod: false,
      hasAcceptedTerms,
      setupIntentClientSecret: setupIntent.client_secret,
      consentText: CONSENT_TEXT,
    });
  } catch (error) {
    return json(500, { error: error?.message || "Erreur Stripe." });
  }
});
