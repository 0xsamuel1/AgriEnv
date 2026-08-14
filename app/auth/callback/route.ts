import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignored
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          username: user.email?.split("@")[0] || "",
          total_score: 0,
        }, { onConflict: "id" });
      }
      const destination = new URL(redirect, origin);
      const safeDestination = destination.origin === origin ? destination : new URL("/", origin);
      safeDestination.searchParams.set("auth", "success");
      return NextResponse.redirect(safeDestination);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
