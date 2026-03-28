




// src/lib/supabase.js pour front
import { createClient } from "@supabase/supabase-js";


// On récupère les variables d'environnement
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);