require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY no .env");
}

const supabase = createClient(url, secretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

module.exports = supabase;
