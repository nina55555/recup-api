const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const PROFILE_MEDIA_BUCKET =
  import.meta.env.VITE_SUPABASE_PROFILE_MEDIA_BUCKET || "profile-media";
const SIGNED_URL_TTL = 60 * 60;

const IMAGE_RULES = {
  "image/jpeg": {
    extension: "jpg",
    signatures: [[0xff, 0xd8, 0xff]],
  },
  "image/png": {
    extension: "png",
    signatures: [[0x89, 0x50, 0x4e, 0x47]],
  },
  "image/webp": {
    extension: "webp",
    signatures: [
      [0x52, 0x49, 0x46, 0x46],
    ],
  },
};

const VIDEO_RULES = {
  "video/mp4": {
    extension: "mp4",
  },
  "video/webm": {
    extension: "webm",
    signatures: [[0x1a, 0x45, 0xdf, 0xa3]],
  },
};

const SOCIAL_HOSTS = {
  instagram: ["instagram.com", "www.instagram.com"],
  facebook: ["facebook.com", "www.facebook.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
  x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  youtube: ["youtube.com", "www.youtube.com", "youtu.be"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
};

const startsWithSignature = (bytes, signature) =>
  signature.every((value, index) => bytes[index] === value);

const isMp4File = (bytes) => {
  const header = Array.from(bytes.slice(4, 8))
    .map((value) => String.fromCharCode(value))
    .join("");

  return header === "ftyp";
};

const readFileHeader = async (file, length = 16) => {
  const buffer = await file.slice(0, length).arrayBuffer();
  return new Uint8Array(buffer);
};

const verifyMimeSignature = (file, rules, bytes) => {
  const rule = rules[file.type];

  if (!rule) {
    return false;
  }

  if (file.type === "video/mp4") {
    return isMp4File(bytes);
  }

  if (file.type === "image/webp") {
    const riffMatch = startsWithSignature(bytes, rule.signatures[0]);
    const webpHeader = Array.from(bytes.slice(8, 12))
      .map((value) => String.fromCharCode(value))
      .join("");

    return riffMatch && webpHeader === "WEBP";
  }

  return (rule.signatures || []).some((signature) =>
    startsWithSignature(bytes, signature)
  );
};

const baseValidation = (file) => {
  if (!file) {
    throw new Error("Aucun fichier n'a ete selectionne.");
  }

  if (file.name.length > 180) {
    throw new Error("Le nom du fichier est trop long.");
  }
};

export const createEmptySecureProfile = () => ({
  avatarPath: "",
  storyImagePath: "",
  storyVideoPath: "",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
    x: "",
    youtube: "",
    linkedin: "",
  },
});

export const resolveSecureProfileRecord = ({ profile, media }) => {
  const empty = createEmptySecureProfile();

  return {
    ...empty,
    avatarPath: media?.avatar_path || "",
    storyImagePath: media?.story_image_path || "",
    storyVideoPath: media?.story_video_path || "",
    socialLinks: {
      ...empty.socialLinks,
      instagram: profile?.instagram_url || "",
      facebook: profile?.facebook_url || "",
      tiktok: profile?.tiktok_url || "",
      x: profile?.x_url || "",
      youtube: profile?.youtube_url || "",
      linkedin: profile?.linkedin_url || "",
    },
  };
};

export const getProfileMediaBucket = () => PROFILE_MEDIA_BUCKET;

/**
 * Retourne URL publique si bucket public, sinon signed URL.
 * Priorité performance : public > signed.
 */
export const getProfileMediaUrl = async (supabase, path) => {
  if (!path) return "";
  
  // Test getpuPublicUrl d'abord (instantané si public)
  const { data: publicData } = supabase.storage
    .from(PROFILE_MEDIA_BUCKET)
    .getPublicUrl(path);
  
  // Si publicUrl non vide, bucket public → utiliser
  if (publicData?.publicUrl) {
    return publicData.publicUrl;
  }
  
  // Fallback signed URL (avec vérifications existantes)
  return createSignedProfileMediaUrl(supabase, path);
};

export const createSignedProfileMediaUrl = async (supabase, path) => {
  if (!path) return "";

  const parts = path.split("/");
  if (parts.length < 2) return "";

  const userId = parts[0];
  const fileName = parts.slice(1).join("/");

  // Optionnel : effort de nettoyage DB si fichier absent
  const attemptCleanup = async () => {
    const update = {};
    if (path.includes("/avatar-")) update.avatar_path = "";
    if (path.includes("/story-image-")) update.story_image_path = "";
    if (path.includes("/story-video-")) update.story_video_path = "";
    if (Object.keys(update).length > 0) {
      await supabase.from("profile_media").update(update).eq("user_id", userId);
    }
  };

  try {
    const { data: files, error: listError } = await supabase.storage
      .from(PROFILE_MEDIA_BUCKET)
      .list(userId, { limit: 1000 });

    if (listError) {
      console.warn(`Erreur list fichiers pour ${path}:`, listError);
      return "";
    }

    const fileExists = files.some((file) => file.name === fileName);

    if (!fileExists) {
      console.warn(`Fichier ${path} n'existe pas dans bucket`);
      await attemptCleanup(); // mise à jour du profil dans la base
      return "";
    }
  } catch (err) {
    console.warn(`Erreur vérif fichier ${path}:`, err);
    return "";
  }

  try {
    const { data, error } = await supabase.storage
      .from(PROFILE_MEDIA_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);

    if (error) {
      console.warn("createSignedUrl error:", error);
      return "";
    }

    return data?.signedUrl || "";
  } catch (err) {
    console.warn("createSignedUrl catch:", err);
    return "";
  }
};

export const validateImageFile = async (file) => {
  baseValidation(file);

  if (!IMAGE_RULES[file.type]) {
    throw new Error("Format image refuse. Utilisez JPG, PNG ou WEBP.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image trop lourde. Limite: 5 Mo.");
  }

  const bytes = await readFileHeader(file);

  if (!verifyMimeSignature(file, IMAGE_RULES, bytes)) {
    throw new Error("Signature de fichier image invalide.");
  }

  return IMAGE_RULES[file.type].extension;
};

export const validateVideoFile = async (file) => {
  baseValidation(file);

  if (!VIDEO_RULES[file.type]) {
    throw new Error("Format video refuse. Utilisez MP4 ou WEBM.");
  }

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video trop lourde. Limite: 20 Mo.");
  }

  const bytes = await readFileHeader(file);

  if (!verifyMimeSignature(file, VIDEO_RULES, bytes)) {
    throw new Error("Signature de fichier video invalide.");
  }

  return VIDEO_RULES[file.type].extension;
};

export const buildStoragePath = ({ userId, kind, extension }) => {
  const safeKind = kind.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  return `${userId}/${safeKind}-${crypto.randomUUID()}.${extension}`;
};

export const sanitizeSocialLink = (platform, rawValue) => {
  const value = rawValue.trim();

  if (!value) {
    return "";
  }

  if (value.length > 300) {
    throw new Error(`Lien ${platform} trop long.`);
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`Lien ${platform} invalide.`);
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    throw new Error(`Lien ${platform} non securise.`);
  }

  const allowedHosts = SOCIAL_HOSTS[platform] || [];
  const hostname = parsedUrl.hostname.toLowerCase();

  if (!allowedHosts.includes(hostname)) {
    throw new Error(`Lien ${platform} refuse.`);
  }

  parsedUrl.hash = "";

  return parsedUrl.toString();
};

export const sanitizeAllSocialLinks = (socialLinks) =>
  Object.fromEntries(
    Object.entries(socialLinks).map(([platform, value]) => [
      platform,
      sanitizeSocialLink(platform, value),
    ])
  );

export const isStorageMissing = (error) => {
  const message = `${error?.message || ""} ${error?.error || ""}`.toLowerCase();
  return (
    message.includes("bucket") ||
    message.includes("storage") ||
    message.includes("not found") ||
    message.includes("does not exist")
  );
};
