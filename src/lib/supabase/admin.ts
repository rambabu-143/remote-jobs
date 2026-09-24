import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Server-only — never import from a
// Client Component. Used for admin.createUser and private Storage access.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
