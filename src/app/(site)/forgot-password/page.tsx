import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="card mx-auto mt-8 max-w-sm">
      <h1 className="text-xl font-semibold text-zinc-900">Reset your password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enter the email on your account and we&apos;ll send you a link to reset your password.
      </p>
      <div className="mt-4">
        <ForgotPasswordForm />
      </div>
      <p className="mt-4 text-sm text-zinc-600">
        <Link href="/login" className="text-ink-600 underline hover:text-ink-700">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
