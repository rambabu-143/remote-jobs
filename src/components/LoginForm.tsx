"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [error, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" name="email" required />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label>Password</Label>
          <Link href="/forgot-password" className="text-xs text-ink-600 underline hover:text-ink-700">
            Forgot password?
          </Link>
        </div>
        <Input type="password" name="password" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="size-4" />}
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}
