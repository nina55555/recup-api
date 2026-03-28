// src/utils/storage.js
import { supabase } from "../lib/supabase";

export async function uploadImage(file) {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file);

  if (error) {
    console.error("Erreur upload:", error);
    return null;
  }

  // récupérer l'URL publique
  const { data: publicData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return publicData.publicUrl; // <-- URL publique pour la DB
}