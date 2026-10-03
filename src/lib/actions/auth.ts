"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Invalid email or password.";

  const profile = await prisma.user.findUnique({ where: { email } });
  redirect(profile?.role === "ADMIN" ? "/admin/jobs" : "/dashboard");
}

export async function registerUser(_prevState: string | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return "Please fill all fields; password must be at least 8 characters.";
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "An account with that email already exists.";
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.APP_URL ?? "http://localhost:3000"}/auth/callback` },
  });
  if (error || !data.user) return error?.message ?? "Could not create account.";

  await prisma.user.create({ data: { id: data.user.id, name, email, role: "USER" } });

  // If the project requires email confirmation, signUp doesn't grant a session yet.
  if (!data.session) {
    return "Account created! Check your email to confirm it, then log in.";
  }

  // Public registration always creates a USER, so this can go straight to the user dashboard.
  redirect("/dashboard");
}
