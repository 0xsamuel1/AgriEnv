"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/frontend/lib/supabase";
import AuthShell from "@/frontend/components/auth/AuthShell";
import GoogleSignInButton from "@/frontend/components/auth/GoogleSignInButton";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      toast.error("Couldn’t sign you in", {
        description: error.message,
      });
      setLoading(false);
    } else {
      toast.success("Welcome back", {
        description: "Opening your AgriEnv workspace…",
      });
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="space-y-5 rounded-[1.4rem] border border-[#dce5dd] bg-white p-5 shadow-[0_18px_50px_rgba(28,59,36,.07)] sm:p-7">
      <GoogleSignInButton redirectTo={redirect} onError={setError} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-11"
              placeholder="you@university.edu"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-11"
              placeholder="Your password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-green-600 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to your workspace" subtitle="Continue your simulations, revision sessions, and group challenges.">
        <Suspense fallback={<div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-2xl">Loading...</div>}>
          <LoginForm />
        </Suspense>
    </AuthShell>
  );
}
