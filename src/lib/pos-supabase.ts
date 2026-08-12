import { createClient } from "@supabase/supabase-js";

// Trayi Jewellers POS Supabase — publishable anon key, RLS-gated read-only access
// to `catalog_products` (active rows only).
export const POS_URL = "https://pdtasnfsdnfttayxibqy.supabase.co";
export const POS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdGFzbmZzZG5mdHRheXhpYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MjgwMjYsImV4cCI6MjA5MzAwNDAyNn0.9Lxg9whQzv7eseBabKvBzLaalTWjnZs6hkl4JfLTb-E";

export const posSupabase = createClient(POS_URL, POS_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
