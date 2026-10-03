import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Log in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="card mx-auto mt-8 max-w-sm">
      <h1 className="text-xl font-semibold text-zinc-900">Log in</h1>
      <div className="mt-4">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-zinc-600">
        No account?{" "}
        <Link href="/register" className="text-ink-600 underline hover:text-ink-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
