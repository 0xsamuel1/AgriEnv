"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/frontend/lib/supabase";

type GoogleCredentialResponse = { credential: string };

type GoogleIdentity = {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce: string;
    use_fedcm_for_prompt?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "signin_with" | "signup_with" | "continue_with";
      shape: "rectangular";
      logo_alignment: "left";
      width: number;
    }
  ): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...Array.from(bytes)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(nonce)
  );
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return { nonce, hashedNonce };
}

interface GoogleSignInButtonProps {
  mode?: "signin" | "signup";
  redirectTo?: string;
  onError?: (message: string) => void;
}

export default function GoogleSignInButton({
  mode = "signin",
  redirectTo = "/",
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const reportError = useCallback(
    (title: string, message: string) => {
      setBusy(false);
      onError?.(message);
      toast.error(title, { description: message });
    },
    [onError]
  );

  const renderGoogleButton = useCallback(async () => {
    if (!clientId) {
      reportError(
        "Google sign-in needs configuration",
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing from .env.local."
      );
      return;
    }

    if (!window.google || !buttonRef.current) return;

    const { nonce, hashedNonce } = await createNonce();
    window.google.accounts.id.initialize({
      client_id: clientId,
      nonce: hashedNonce,
      use_fedcm_for_prompt: true,
      callback: async ({ credential }) => {
        setBusy(true);
        onError?.("");

        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: credential,
          nonce,
        });

        if (error) {
          reportError("Google sign-in failed", error.message);
          return;
        }

        const user = data.user;
        if (user) {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              full_name:
                user.user_metadata?.full_name || user.user_metadata?.name || "",
              username: user.email?.split("@")[0] || "",
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            },
            { onConflict: "id" }
          );
        }

        toast.success(mode === "signup" ? "Welcome to AgriEnv" : "Welcome back", {
          description: "You’re signed in and your workspace is ready.",
        });
        router.push(redirectTo);
        router.refresh();
      },
    });

    buttonRef.current.replaceChildren();
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: mode === "signup" ? "signup_with" : "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(buttonRef.current.clientWidth || 400, 400),
    });
  }, [clientId, mode, onError, redirectTo, reportError, router]);

  useEffect(() => {
    if (window.google) void renderGoogleButton();
  }, [renderGoogleButton]);

  return (
    <div className="relative min-h-11 w-full overflow-hidden rounded-xl">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => void renderGoogleButton()}
        onError={() =>
          reportError(
            "Google sign-in couldn’t load",
            "Check your connection and try again."
          )
        }
      />
      <div
        ref={buttonRef}
        className={`flex min-h-11 w-full justify-center transition-opacity ${
          busy ? "pointer-events-none opacity-40" : ""
        }`}
        aria-label={mode === "signup" ? "Sign up with Google" : "Continue with Google"}
      />
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/85 text-sm font-semibold text-[#31523b]">
          <Loader2 className="h-4 w-4 animate-spin" /> Signing you in…
        </div>
      )}
    </div>
  );
}
