"use client";

import { useActionState } from "react";
import { registerUser } from "@/lib/actions/auth";
import Spinner from "./Spinner";

export default function RegisterForm() {
  const [error, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="field-label">Name</label>
        <input type="text" name="name" required className="field-input" />
      </div>
      <div>
        <label className="field-label">Email</label>
        <input type="email" name="email" required className="field-input" />
      </div>
      <div>
        <label className="field-label">Password</label>
        <input type="password" name="password" required minLength={8} className="field-input" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary flex w-full items-center justify-center gap-2">
        {pending && <Spinner className="size-4" />}
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
