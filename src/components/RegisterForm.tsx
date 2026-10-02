"use client";

import { useActionState } from "react";
import { registerUser } from "@/lib/actions/auth";
import Spinner from "./Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const [error, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label>Name</Label>
        <Input type="text" name="name" required />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" name="email" required />
      </div>
      <div className="space-y-1">
        <Label>Password</Label>
        <Input type="password" name="password" required minLength={8} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="size-4" />}
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
