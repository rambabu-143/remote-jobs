import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Set a new password", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return (
    <div className="card mx-auto mt-8 max-w-sm">
      <h1 className="text-xl font-semibold text-zinc-900">Set a new password</h1>
      <div className="mt-4">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
