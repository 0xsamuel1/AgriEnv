"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/frontend/lib/supabase";
import AuthShell from "@/frontend/components/auth/AuthShell";
import GoogleSignInButton from "@/frontend/components/auth/GoogleSignInButton";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      toast.error("Couldn’t create your account", {
        description: signUpError.message,
      });
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        username: email.split("@")[0],
        total_score: 0,
      });
      if (data.session) {
        toast.success("Welcome to AgriSim", {
          description: "Your student workspace is ready.",
        });
        router.push("/");
        router.refresh();
      } else {
        toast.success("Check your inbox", {
          description: "We sent you a confirmation link to finish creating your account.",
          duration: 7000,
        });
        setLoading(false);
      }
    }
  };

  return (
    <AuthShell eyebrow="Create your account" title="Start learning with AgriSim" subtitle="Join your coursemates in a purpose-built Agricultural Engineering study workspace.">
        <div className="space-y-5 rounded-[1.4rem] border border-[#dce5dd] bg-white p-5 shadow-[0_18px_50px_rgba(28,59,36,.07)] sm:p-7">
          <GoogleSignInButton mode="signup" onError={setError} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-11" placeholder="Your full name" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11" placeholder="you@university.edu" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11" placeholder="Min 6 characters" minLength={6} required />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}
