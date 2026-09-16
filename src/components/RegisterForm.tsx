"use client";

import { useActionState } from "react";
import { registerUser } from "@/lib/actions/auth";

export default function RegisterForm() {
  const [error, formAction, pending] = useActionState(registerUser, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-300">Name</label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-300">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-300">Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-zinc-800 px-3 py-2 text-sm bg-black text-white"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
