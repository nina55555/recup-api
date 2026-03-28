import axios from "axios";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { supabase } from "./src/lib/supabaseClient.js";

const bucketName = "profile-media";

const isSupabaseUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.includes("supabase.co/storage");
};

const normalizeExt = (url, contentType) => {
  const urlPath = new URL(url).pathname;
  const extFromUrl = path.extname(urlPath).split("?")[0] || "";
  if (extFromUrl) return extFromUrl;
  if (!contentType) return ".bin";
  if (contentType.includes("jpeg")) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("mp4")) return ".mp4";
  return ".bin";
};

const downloadFile = async (url) => {
  if (url.startsWith("file://")) {
    const localPath = url.replace("file://", "");
    if (!fs.existsSync(localPath)) throw new Error(`Local file not found: ${localPath}`);
    const buffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath) || ".bin";
    return { buffer, ext, contentType: undefined };
  }

  const response = await axios.get(url, { responseType: "arraybuffer" });
  const contentType = response.headers["content-type"];
  const ext = normalizeExt(url, contentType);
  return { buffer: Buffer.from(response.data), ext, contentType };
};

const uploadToProfileMedia = async (userId, mediaKind, sourceUrl) => {
  const { buffer, ext, contentType } = await downloadFile(sourceUrl);
  const fileName = `${mediaKind}-${uuidv4()}${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: contentType || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: publicData, error: publicError } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (publicError) throw publicError;
  return publicData.publicUrl;
};

const migrateProfileMedia = async () => {
  console.log("Début migration profile media…");

  const { data: profiles, error: fetchError } = await supabase
    .from("profiles")
    .select("id, avatar_url, story_image_url, story_video_url");

  if (fetchError) {
    console.error("Impossible de récupérer les profiles:", fetchError);
    process.exit(1);
  }

  for (const profile of profiles) {
    const userId = profile.id;
    if (!userId) continue;

    const mediaFields = [
      { key: "avatar_url", kind: "avatar" },
      { key: "story_image_url", kind: "story-image" },
      { key: "story_video_url", kind: "story-video" },
    ];

    const updates = {};

    for (const { key, kind } of mediaFields) {
      const sourceUrl = profile[key];
      if (!sourceUrl || isSupabaseUrl(sourceUrl)) continue;

      try {
        console.log(`Upload ${kind} pour ${userId} depuis ${sourceUrl}`);
        const publicUrl = await uploadToProfileMedia(userId, kind, sourceUrl);
        updates[key] = publicUrl;
      } catch (err) {
        console.warn(`Échec upload ${kind} pour ${userId}:`, err.message || err);
      }
    }

    if (Object.keys(updates).length === 0) continue;

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (updateError) {
      console.error(`Impossible de mettre à jour profile ${userId}:`, updateError);
    } else {
      console.log(`Profile ${userId} mis à jour`, updates);
    }
  }

  console.log("Migration profile media finie.");
};

migrateProfileMedia().catch((err) => {
  console.error("Erreur script migrateProfileMedia:", err);
  process.exit(1);
});