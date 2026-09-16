import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-zinc-800 bg-black p-6">
      <h1 className="text-xl font-semibold">Create an account</h1>
      <div className="mt-4">
        <RegisterForm />
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
