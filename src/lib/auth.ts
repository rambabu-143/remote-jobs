import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export type Session = { user: { id: string; email: string; name: string; role: Role } } | null;

// Authentication (who is this?) comes from Supabase Auth; authorization
// (what can they do?) comes from the matching row in our own User table,
// looked up by the Supabase user's id. Keeps every existing `session.user.role`
// check in the app working unchanged.
//
// Wrapped in React's cache() because Nav (in the root layout) calls this on
// every request, and most pages call it again for their own session check —
// without dedup that's 2x the Supabase round-trip + Prisma lookup per request.
export const auth = cache(async (): Promise<Session> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  return { user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role } };
});

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
