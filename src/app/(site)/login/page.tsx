import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-zinc-800 bg-black p-6">
      <h1 className="text-xl font-semibold">Log in</h1>
      <p className="mt-1 text-sm text-zinc-500">Admin demo login: admin@example.com / admin1234</p>
      <div className="mt-4">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        No account?{" "}
        <Link href="/register" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
