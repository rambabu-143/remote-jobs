import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="card mx-auto mt-8 max-w-sm">
      <h1 className="text-xl font-semibold text-white">Set a new password</h1>
      <div className="mt-4">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
