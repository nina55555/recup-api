import { createClient } from "@supabase/supabase-js";

/*
const supabaseUrl = "TON_URL_SUPABASE";
const supabaseKey = "TA_PUBLIC_ANON_KEY";
*/


const supabaseUrl = "https://xfsmndahgnpsckxblfew.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmc21uZGFoZ25wc2NreGJsZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjg3NTQsImV4cCI6MjA4ODg0NDc1NH0.L8UFqdhrpOJq8MKNmmOel7SqzowZ5FSxRurh-3CquBQ";


/* creer le process.env avec process.env.SUPABASE_KEY
*/

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);