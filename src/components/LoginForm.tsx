"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";

export default function LoginForm() {
  const [error, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="field-label">Email</label>
        <input type="email" name="email" required className="field-input" />
      </div>
      <div>
        <label className="field-label">Password</label>
        <input type="password" name="password" required className="field-input" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
