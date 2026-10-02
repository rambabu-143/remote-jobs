"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The recovery link's session tokens live in the URL hash fragment, which
  // only the browser ever sees. supabase-js parses it automatically on load
  // and fires PASSWORD_RECOVERY; we just wait for that (or an existing
  // session, in case it already fired before this listener attached).
  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        settled = true;
        setReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setReady(true);
      }
    });

    const timeout = setTimeout(() => {
      if (!settled) setLinkInvalid(true);
    }, 3000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    router.push("/dashboard");
  }

  if (linkInvalid) {
    return (
      <p className="text-sm text-red-600">
        This reset link is invalid or has expired. Request a new one from the{" "}
        <a href="/forgot-password" className="text-ink-600 underline hover:text-ink-700">
          forgot password
        </a>{" "}
        page.
      </p>
    );
  }

  if (!ready) {
    return <p className="text-sm text-zinc-600">Verifying your reset link…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>New password</Label>
        <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="size-4" />}
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
