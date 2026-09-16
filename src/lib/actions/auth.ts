"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error;
  }
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
    await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created, but sign-in failed. Please log in.";
    }
    throw error;
  }
}
