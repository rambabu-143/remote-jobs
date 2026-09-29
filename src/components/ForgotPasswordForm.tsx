"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Spinner from "./Spinner";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Don't reveal whether the email exists, same message either way.
    setMessage("If an account exists for that email, a reset link is on its way.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <button type="submit" disabled={pending} className="btn-primary flex w-full items-center justify-center gap-2">
        {pending && <Spinner className="size-4" />}
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
