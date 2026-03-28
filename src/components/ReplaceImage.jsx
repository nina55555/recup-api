


//peut etre supprimé 



// src/components/ReplaceImage.jsx

/*
import { useState } from "react";
import { uploadImage } from "../utils/storage";
import { supabase } from "../lib/supabase";

export default function ReplaceImage({ modelId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleReplace = async () => {
    if (!file) return alert("Choisis un fichier");
    setLoading(true);

    const publicUrl = await uploadImage(file);
    if (!publicUrl) return setLoading(false);

    const { data, error } = await supabase
      .from("models")
      .update({ image_url: publicUrl })
      .eq("id", modelId);

    if (error) console.error("Erreur update image:", error);
    else console.log("Image remplacée avec succès !", data);

    setLoading(false);
    setFile(null);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleReplace} disabled={loading}>
        {loading ? "Upload..." : "Remplacer l'image"}
      </button>
    </div>
  );
}
  */