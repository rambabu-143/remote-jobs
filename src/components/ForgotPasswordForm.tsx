"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="size-4" />}
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
