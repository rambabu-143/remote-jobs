import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="card mx-auto mt-8 max-w-sm">
      <h1 className="text-xl font-semibold text-white">Create an account</h1>
      <div className="mt-4">
        <RegisterForm />
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-copper-400 underline hover:text-copper-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
