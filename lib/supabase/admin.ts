import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con service_role. SOLO servidor. Salta RLS: usar con cuidado y
// siempre tras verificar permisos (p. ej. que quien llama es admin).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
