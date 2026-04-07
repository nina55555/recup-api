// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.25.0";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

    if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !webhookSecret) {
      return json(500, { error: "Configuration webhook manquante." });
    }

    const stripeSignature = req.headers.get("stripe-signature") || "";
    if (!stripeSignature) {
      return json(400, { error: "Header stripe-signature manquant." });
    }

    const rawBody = await req.text();
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" });
    const event = await stripe.webhooks.constructEventAsync(rawBody, stripeSignature, webhookSecret);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existingWebhookEvent } = await adminClient
      .from("stripe_webhook_events")
      .select("stripe_event_id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingWebhookEvent?.stripe_event_id) {
      return json(200, { ok: true, duplicate: true, eventId: event.id });
    }

    const { error: insertWebhookError } = await adminClient.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      received_at: new Date().toISOString(),
    });

    if (insertWebhookError) {
      // idempotency race: if another worker inserted first, treat as success
      if (!String(insertWebhookError.message || "").toLowerCase().includes("duplicate")) {
        return json(500, { error: insertWebhookError.message || "Insertion webhook impossible." });
      }
      return json(200, { ok: true, duplicate: true, eventId: event.id });
    }

    let processError = "";

    try {
      if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object;
        const intentId = intent.id;

        const { data: chargeRow } = await adminClient
          .from("auction_charge_attempts")
          .select("product_id")
          .eq("stripe_payment_intent_id", intentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        await adminClient
          .from("auction_charge_attempts")
          .update({ status: "succeeded", error_message: null })
          .eq("stripe_payment_intent_id", intentId);

        await adminClient
          .from("models")
          .update({
            auction_settlement_status: "charged",
            auction_settled_at: new Date().toISOString(),
          })
          .eq("stripe_deposit_payment_intent_id", intentId);

        if (chargeRow?.product_id) {
          await adminClient
            .from("models")
            .update({ auction_settlement_status: "charged" })
            .eq("id", chargeRow.product_id);
        }
      }

      if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object;
        const intentId = intent.id;
        const message = intent.last_payment_error?.message || "Paiement echoue.";

        await adminClient
          .from("auction_charge_attempts")
          .update({ status: "payment_failed", error_message: message })
          .eq("stripe_payment_intent_id", intentId);

        await adminClient
          .from("models")
          .update({ auction_settlement_status: "failed" })
          .eq("stripe_deposit_payment_intent_id", intentId);
      }

      if (event.type === "charge.refunded") {
        const charge = event.data.object;
        const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";
        if (intentId) {
          await adminClient
            .from("auction_charge_attempts")
            .update({ status: "refunded", error_message: null })
            .eq("stripe_payment_intent_id", intentId);

          await adminClient
            .from("models")
            .update({ auction_settlement_status: "refunded" })
            .eq("stripe_deposit_payment_intent_id", intentId);
        }
      }
    } catch (handlerError) {
      processError = handlerError?.message || "Erreur traitement event webhook.";
    }

    await adminClient
      .from("stripe_webhook_events")
      .update({
        processed_at: new Date().toISOString(),
        processing_error: processError || null,
      })
      .eq("stripe_event_id", event.id);

    if (processError) {
      return json(500, { error: processError, eventId: event.id });
    }

    return json(200, { ok: true, eventId: event.id, type: event.type });
  } catch (error) {
    return json(400, { error: error?.message || "Webhook invalide." });
  }
});
