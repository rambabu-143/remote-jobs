import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="card mx-auto mt-8 max-w-sm">
      <h1 className="text-xl font-semibold text-white">Log in</h1>
      <div className="mt-2 space-y-0.5 text-sm text-zinc-500">
        <p>Demo admin: admin@example.com / admin1234</p>
        <p>Demo user: jane@example.com / user1234</p>
      </div>
      <div className="mt-4">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        No account?{" "}
        <Link href="/register" className="text-copper-400 underline hover:text-copper-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}
