"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "./sonner";

const notices: Record<string, { title: string; description?: string }> = {
  signed_out: {
    title: "You’re signed out",
    description: "Your AgriEnv session ended securely.",
  },
};

export default function AppNotifications() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const auth = url.searchParams.get("auth");
    const notice = url.searchParams.get("notice");
    const error = url.searchParams.get("error");

    if (auth === "success") {
      toast.success("Welcome to AgriEnv", {
        description: "You’re signed in and your workspace is ready.",
      });
    } else if (error === "auth_failed") {
      toast.error("Google sign-in didn’t finish", {
        description: "Please try again. If it continues, check the Supabase redirect settings.",
      });
    } else if (notice && notices[notice]) {
      toast.success(notices[notice].title, {
        description: notices[notice].description,
      });
    }

    if (auth || notice || error === "auth_failed") {
      url.searchParams.delete("auth");
      url.searchParams.delete("notice");
      if (error === "auth_failed") url.searchParams.delete("error");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  return <Toaster />;
}
