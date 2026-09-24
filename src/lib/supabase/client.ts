import { createBrowserClient } from "@supabase/ssr";

// Browser-only client. Needed for the reset-password flow specifically:
// Supabase's recovery link puts the session tokens in the URL hash fragment,
// which never reaches the server — only this client-side SDK can read it.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
