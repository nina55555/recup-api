import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "productId requis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: bidRows, error: bidsError } = await adminClient
      .from("bids")
      .select("user_id")
      .eq("product_id", productId);

    if (bidsError) {
      throw bidsError;
    }

    const userIds = [...new Set((bidRows || []).map((row) => row.user_id).filter(Boolean))];

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ items: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: mediaRows, error: mediaError } = await adminClient
      .from("profile_media")
      .select("user_id, story_image_path, story_video_path")
      .in("user_id", userIds);

    if (mediaError) {
      throw mediaError;
    }

    const bucket = "profile-media";
    const items: Record<string, { storyImageUrl: string; storyVideoUrl: string }> = {};

    await Promise.all(
      (mediaRows || []).map(async (row) => {
        const result = {
          storyImageUrl: "",
          storyVideoUrl: "",
        };

        if (row.story_image_path) {
          const { data } = await adminClient.storage
            .from(bucket)
            .createSignedUrl(row.story_image_path, 60 * 60 * 24);

          result.storyImageUrl = data?.signedUrl || "";
        }

        if (row.story_video_path) {
          const { data } = await adminClient.storage
            .from(bucket)
            .createSignedUrl(row.story_video_path, 60 * 60 * 24);

          result.storyVideoUrl = data?.signedUrl || "";
        }

        items[row.user_id] = result;
      })
    );

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error?.message || "Erreur edge function." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
