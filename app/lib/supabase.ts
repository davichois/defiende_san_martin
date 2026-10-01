// Cliente de Supabase SOLO para el servidor (usa la service_role key, que nunca llega al navegador).
// Variables en .env.local:
//   SUPABASE_URL=https://<tu-proyecto>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service_role key de Project Settings → API>
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cliente ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cliente;
}
