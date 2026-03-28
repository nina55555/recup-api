


//je peux supprimer





// migrateImages.js

import axios from 'axios';
import path from 'path';
import { supabase } from './src/lib/supabaseClient.js';


// ton tableau de modèles existants
const models = 
[
 
  {
    _id: "699d3f9d6b96d7e7cc8396ce",
    title: "model-myla",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAjTfnTPSO0g7yWWNB6rhP3H3TxJ1_Yq2kAw&s",
  },
  {
    _id:  "699d3f276b96d7e7cc8396c8",
    title:  "model-mui",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBKfdmEoH9y9dIyRWpaXIUo4MZ8bfNL2ZgSg&s",
  },
  {
    _id: "699d3f036b96d7e7cc8396c6",
    title: "model-mei",
    imageUrl:  "https://espritdegabrielle.com/wp-content/uploads/2025/12/CHANEL-CROISIERE-2025-26-09-600x454.jpg",
  },
  {
    _id: "699d3eb36b96d7e7cc8396c2",
    title:  "model-mani",
    imageUrl:  "https://img.lemde.fr/2012/06/02/156/0/661/441/664/0/75/0/ill_1710342_9548_201206021.0.967310179doucasort_dior_ori.jpg",
  },
  {
    _id: "699d3e0b6b96d7e7cc8396bd",
    title: "model-nini",
    imageUrl: "https://media.vogue.fr/photos/5c2f59aa346475e8b8c93a48/master/w_1024%2Cc_limit/robert___sonia___sterling_jpg_3134.jpg",
  },
  {
    _id: "699d3e836b96d7e7cc8396c0",
    title: "model-mani",
    imageUrl:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6rKLE8LV9Jb2amffuFztLYoM1bonIa7ghEQ&s"
,
  },
  {
    _id: "699d3ddf6b96d7e7cc8396bb",
    title: "model-gagi",
    imageUrl: "https://cache.cosmopolitan.fr/data/photo/w680_c17/69/look-collection-croisiere-louis-vuitton.jpg"
,
  }






  // ajoute toutes tes données ici
];











async function migrateImages() {
  for (let model of models) {
    try {
      // télécharger l'image
      const response = await axios.get(model.imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // générer un nom de fichier unique
      const fileName = `${Date.now()}-${path.basename(model.imageUrl.split('%2F').pop())}`;

      // upload dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, buffer, { contentType: 'image/jpeg' });

      if (uploadError) {
        console.error(`Erreur upload ${model._id}:`, uploadError.message);
        continue;
      }

      // récupérer l'URL publique
      const { data: publicData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      const imageUrlSupabase = publicData.publicUrl;
      console.log(`Migré ${model._id} → ${imageUrlSupabase}`);

      // insérer directement dans la table 'models' Supabase
      const { data: dbData, error: dbError } = await supabase
        .from('models')
        .insert([
          {
            title: model.title,
            image_url: imageUrlSupabase
          }
        ]);

      if (dbError) {
        console.error(`Erreur DB ${model._id}:`, dbError.message);
      } else {
        console.log(`Modèle ${model._id} inséré en DB`);
      }

    } catch (err) {
      console.error(`Erreur migration ${model._id}:`, err.message);
    }
  }

  console.log("Migration complète !");
}

migrateImages();
