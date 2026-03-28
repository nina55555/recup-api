// migrateModels.js
import axios from "axios";
import path from "path";
import { supabase } from "./src/lib/supabaseClient.js"; // client backend

// Exemple de tes modèles existants (standardized to image_url)
const models = [
  // suppressions des deux premiers Firebase cassés
  /*
  {
    id: "6675f08811a0b37f79157475",
    title: "model-test3",
    image_url: "https://firebasestorage.googleapis.com/....",
  },
  {
    id: "66b17818f190d124e67db65a",
    title: "model-d-Amazonica",
    image_url: "https://firebasestorage.googleapis.com/....",
  },
  */
  {
    id: "699d3f9d6b96d7e7cc8396ce",
    title: "model-myla",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAjTfnTPSO0g7yWWNB6rhP3H3TxJ1_Yq2kAw&s",
  },
  {
    id: "699d3f276b96d7e7cc8396c8",
    title: "model-mui",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBKfdmEoH9y9dIyRWpaXIUo4MZ8bfNL2ZgSg&s",
  },
  {
    id: "699d3f036b96d7e7cc8396c6",
    title: "model-mei",
    image_url: "https://espritdegabrielle.com/wp-content/uploads/2025/12/CHANEL-CROISIERE-2025-26-09-600x454.jpg",
  },
  {
    id: "699d3eb36b96d7e7cc8396c2",
    title: "model-mani",
    image_url: "https://img.lemde.fr/2012/06/02/156/0/661/441/664/0/75/0/ill_1710342_9548_201206021.0.967310179doucasort_dior_ori.jpg",
  },
  {
    id: "699d3e0b6b96d7e7cc8396bd",
    title: "model-nini",
    image_url: "https://media.vogue.fr/photos/5c2f59aa346475e8b8c93a48/master/w_1024%2Cc_limit/robert___sonia___sterling_jpg_3134.jpg",
  },
  {
    id: "699d3e836b96d7e7cc8396c0",
    title: "model-mani",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6rKLE8LV9Jb2amffuFztLYoM1bonIa7ghEQ&s",
  },
  {
    id: "699d3ddf6b96d7e7cc8396bb",
    title: "model-gagi",
    image_url: "https://cache.cosmopolitan.fr/data/photo/w680_c17/69/look-collection-croisiere-louis-vuitton.jpg",
  },
  // ajoute toutes tes données ici
];

async function migrateModels() {
  for (let model of models) {
    try {
      console.log(`Processing model ${model.id} ...`);

      // Check if image_url exists
      if (!model.image_url) {
        console.error(`No image_url for ${model.id}`);
        continue;
      }

      // 1️⃣ Télécharger l'image
      const response = await axios.get(model.image_url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);

      // 2️⃣ Générer un nom unique pour Supabase Storage
      const fileName = `${Date.now()}-${path.basename(model.image_url.split("%2F").pop())}`;

      // 3️⃣ Upload dans Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: true, // écrase si déjà présent
        });

      if (uploadError) {
        console.error(`Upload error for ${model.id}:`, uploadError.message);
        continue;
      }

      // 4️⃣ Récupérer l'URL publique
      const { data: publicData } = supabase.storage.from("images").getPublicUrl(fileName);
      const newUrl = publicData.publicUrl;

      // 5️⃣ Vérifier si le modèle existe déjà dans Supabase
      const { data: existing, error: fetchError } = await supabase
        .from("models")
        .select("id")
        .eq("id", model.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error(`Fetch error for ${model.id}:`, fetchError.message);
        continue;
      }

      if (existing) {
        // Mettre à jour l'image existante
        const { error: updateError } = await supabase
          .from("models")
          .update({ image_url: newUrl })
          .eq("id", model.id);

        if (updateError) console.error(`Update error for ${model.id}:`, updateError.message);
        else console.log(`✅ Model ${model.id} updated with new image`);
      } else {
        // Insérer le modèle
        const { error: insertError } = await supabase
          .from("models")
          .insert([{ id: model.id, title: model.title, image_url: newUrl }]);

        if (insertError) console.error(`Insert error for ${model.id}:`, insertError.message);
        else console.log(`✅ Model ${model.id} inserted in DB`);
      }

    } catch (err) {
      console.error(`Error processing ${model.id}:`, err.message);
    }
  }

  console.log("Migration finished!");
}

// Lancer la migration
migrateModels();