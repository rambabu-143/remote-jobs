"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  try {
    await signIn("credentials", { ...Object.fromEntries(formData), redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  redirect(user?.role === "ADMIN" ? "/admin/jobs" : "/dashboard");
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

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash, role: "USER" } });

  try {
    // Public registration always creates a USER, so this can go straight to the user dashboard.
    await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created, but sign-in failed. Please log in.";
    }
    throw error;
  }
}
