import { supabase } from "./src/lib/supabaseClient.js";

async function testBucket() {
  const { data, error } = await supabase.storage
    .from("profile-media")
    .list("", { limit: 20 });

  console.log("profile-media list data:", data);
  console.log("profile-media list error:", error);
}

testBucket().catch((err) => {
  console.error("testBucket failed:", err);
});