import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for the sign-up confirmation link: swaps the one-time ?code for a
// session so the user arrives logged in. Falls back to /login if the code can't be
// exchanged (e.g. link opened in a different browser than the one that signed up).
export async function GET(req: Request) {
  const { origin, searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }
  return NextResponse.redirect(`${origin}/login`);
}
