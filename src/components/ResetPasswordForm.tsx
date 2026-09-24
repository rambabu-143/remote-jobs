"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      <p className="text-sm text-red-400">
        This reset link is invalid or has expired. Request a new one from the{" "}
        <a href="/forgot-password" className="text-copper-400 underline hover:text-copper-300">
          forgot password
        </a>{" "}
        page.
      </p>
    );
  }

  if (!ready) {
    return <p className="text-sm text-zinc-400">Verifying your reset link…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">New password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
