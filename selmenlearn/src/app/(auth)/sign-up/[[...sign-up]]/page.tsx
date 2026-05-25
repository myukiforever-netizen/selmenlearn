import { SignUp } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Créer un compte" };

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">SelmenLearn</span>
          </Link>
          <p className="text-slate-400 text-sm">Crée ton compte gratuitement en 30 secondes</p>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: "#1e1b4b",
              colorText: "#f8fafc",
              colorInputBackground: "#0f172a",
              colorInputText: "#f8fafc",
              borderRadius: "0.75rem",
            },
          }}
        />
      </div>
    </div>
  );
}
