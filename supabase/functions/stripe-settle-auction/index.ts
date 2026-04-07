// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toCents = (amount: number, percentage: number) =>
  Math.max(1, Math.round(amount * 100 * (percentage / 100)));

const settleOneAuction = async ({
  adminClient,
  stripe,
  productId,
  nowIso,
  runId,
}: {
  adminClient: ReturnType<typeof createClient>;
  stripe: Stripe;
  productId: string;
  nowIso: string;
  runId: string;
}) => {
  const { data: lockRow, error: lockError } = await adminClient
    .from("models")
    .update({ auction_settlement_status: "processing" })
    .eq("id", productId)
    .in("auction_settlement_status", ["pending", "failed"])
    .select("id, title, auction_end_at, auction_settlement_status, stripe_deposit_payment_intent_id")
    .maybeSingle();

  if (lockError) {
    return { productId, status: "lock_error", error: lockError.message };
  }

  if (!lockRow?.id) {
    return { productId, status: "skipped_locked_or_done" };
  }

  const { data: bestBid, error: bidError } = await adminClient
    .from("bids")
    .select("user_id, amount, created_at, auto_debit_percentage")
    .eq("product_id", productId)
    .order("amount", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (bidError) {
    await adminClient
      .from("models")
      .update({ auction_settlement_status: "failed" })
      .eq("id", productId);
    return { productId, status: "bid_query_error", error: bidError.message };
  }

  if (!bestBid?.user_id || !Number.isFinite(Number(bestBid.amount))) {
    await adminClient
      .from("models")
      .update({
        auction_settlement_status: "no_bids",
        auction_settled_at: nowIso,
      })
      .eq("id", productId);
    return { productId, status: "no_bids" };
  }

  const winnerUserId = bestBid.user_id;
  const winningBid = Number(bestBid.amount);
  const percentage = Number.isFinite(Number(bestBid.auto_debit_percentage))
    ? Number(bestBid.auto_debit_percentage)
    : 50;
  const amountCents = toCents(winningBid, percentage);

  const { data: consentRow } = await adminClient
    .from("auction_bidder_consents")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", winnerUserId)
    .maybeSingle();

  if (!consentRow?.product_id) {
    await adminClient
      .from("auction_charge_attempts")
      .insert({
        product_id: productId,
        user_id: winnerUserId,
        bid_amount: winningBid,
        amount_cents: amountCents,
        status: "missing_consent",
        error_message: "Gagnant sans consentement auto-debit Stripe.",
      });

    await adminClient
      .from("models")
      .update({
        auction_settlement_status: "failed",
        auction_winner_user_id: winnerUserId,
        auction_winning_bid: winningBid,
      })
      .eq("id", productId);

    return { productId, status: "missing_consent" };
  }

  const { data: paymentMethodRow } = await adminClient
    .from("bidder_payment_methods")
    .select("stripe_customer_id, stripe_payment_method_id")
    .eq("user_id", winnerUserId)
    .maybeSingle();

  if (!paymentMethodRow?.stripe_customer_id || !paymentMethodRow?.stripe_payment_method_id) {
    await adminClient
      .from("auction_charge_attempts")
      .insert({
        product_id: productId,
        user_id: winnerUserId,
        bid_amount: winningBid,
        amount_cents: amountCents,
        status: "missing_payment_method",
        error_message: "Gagnant sans moyen de paiement Stripe valide.",
      });

    await adminClient
      .from("models")
      .update({
        auction_settlement_status: "failed",
        auction_winner_user_id: winnerUserId,
        auction_winning_bid: winningBid,
      })
      .eq("id", productId);

    return { productId, status: "missing_payment_method" };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: "eur",
        customer: paymentMethodRow.stripe_customer_id,
        payment_method: paymentMethodRow.stripe_payment_method_id,
        confirm: true,
        off_session: true,
        automatic_payment_methods: { enabled: false },
        metadata: {
          product_id: productId,
          winner_user_id: winnerUserId,
          charge_type: "auction_deposit_50pct",
          settlement_run_id: runId,
        },
      },
      {
        idempotencyKey: `auction_deposit_${productId}`,
      }
    );

    await adminClient.from("auction_charge_attempts").insert({
      product_id: productId,
      user_id: winnerUserId,
      bid_amount: winningBid,
      amount_cents: amountCents,
      stripe_payment_intent_id: paymentIntent.id,
      status: paymentIntent.status || "created",
      error_message: null,
    });

    const finalStatus = paymentIntent.status === "succeeded" ? "charged" : "processing";

    await adminClient
      .from("models")
      .update({
        auction_settlement_status: finalStatus,
        auction_settled_at: finalStatus === "charged" ? nowIso : null,
        auction_winner_user_id: winnerUserId,
        auction_winning_bid: winningBid,
        deposit_amount_cents: amountCents,
        stripe_deposit_payment_intent_id: paymentIntent.id,
      })
      .eq("id", productId);

    return {
      productId,
      status: finalStatus,
      paymentIntentId: paymentIntent.id,
      amountCents,
      winnerUserId,
    };
  } catch (error) {
    const message = error?.message || "Paiement Stripe refuse.";

    const maybeIntentId =
      typeof error?.raw?.payment_intent?.id === "string" ? error.raw.payment_intent.id : null;

    await adminClient.from("auction_charge_attempts").insert({
      product_id: productId,
      user_id: winnerUserId,
      bid_amount: winningBid,
      amount_cents: amountCents,
      stripe_payment_intent_id: maybeIntentId,
      status: "payment_failed",
      error_message: message,
    });

    await adminClient
      .from("models")
      .update({
        auction_settlement_status: "failed",
        auction_winner_user_id: winnerUserId,
        auction_winning_bid: winningBid,
        deposit_amount_cents: amountCents,
        stripe_deposit_payment_intent_id: maybeIntentId,
      })
      .eq("id", productId);

    return { productId, status: "payment_failed", error: message, paymentIntentId: maybeIntentId };
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const cronSecret = Deno.env.get("AUCTION_CRON_SECRET") || "";

    if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
      return json(500, { error: "Configuration Supabase/Stripe manquante." });
    }

    const headerSecret = req.headers.get("x-cron-secret") || "";
    if (cronSecret && headerSecret !== cronSecret) {
      return json(401, { error: "Secret cron invalide." });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" });
    const payload = await req.json().catch(() => ({}));
    const productId = payload?.productId ? String(payload.productId) : "";
    const now = new Date();
    const nowIso = now.toISOString();
    const runId = crypto.randomUUID();

    let productsToSettle: Array<{ id: string }> = [];

    if (productId) {
      productsToSettle = [{ id: productId }];
    } else {
      const { data: products, error: productsError } = await adminClient
        .from("models")
        .select("id")
        .lte("auction_end_at", nowIso)
        .in("auction_settlement_status", ["pending", "failed"])
        .order("auction_end_at", { ascending: true })
        .limit(50);

      if (productsError) {
        return json(500, { error: productsError.message || "Lecture encheres impossible." });
      }

      productsToSettle = products || [];
    }

    if (productsToSettle.length === 0) {
      return json(200, { ok: true, runId, settled: [], message: "Aucune enchere a regler." });
    }

    const settled = [];
    for (const product of productsToSettle) {
      // sequential by design to keep Stripe load low and logs readable
      const result = await settleOneAuction({
        adminClient,
        stripe,
        productId: product.id,
        nowIso,
        runId,
      });
      settled.push(result);
    }

    return json(200, { ok: true, runId, settled });
  } catch (error) {
    return json(500, { error: error?.message || "Erreur settlement." });
  }
});
