
//supabaseClient.js file

// src/lib/supabase.js pour backend (node.js)

import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);