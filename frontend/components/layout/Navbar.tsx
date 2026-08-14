"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, FileQuestion, Swords, Mic, Lightbulb, LogOut, Trophy, User, Menu, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/frontend/lib/supabase";
import Brand from "./Brand";

const navItems = [
  { href: "/simulate", label: "Simulations", icon: FlaskConical },
  { href: "/questions", label: "Question Lab", icon: FileQuestion },
  { href: "/showdown", label: "Showdown", icon: Swords },
  { href: "/voice", label: "Voice Study", icon: Mic },
  { href: "/projects", label: "Project Lab", icon: Lightbulb },
  { href: "/showdown/leaderboard", label: "Rankings", icon: Trophy },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser ? { email: authUser.email, full_name: authUser.user_metadata?.full_name } : null);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user?: { email?: string; user_metadata?: Record<string, string> } } | null) => {
      setUser(session?.user ? { email: session.user.email, full_name: session.user.user_metadata?.full_name } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Couldn’t sign you out", { description: error.message });
      return;
    }
    window.location.href = "/?notice=signed_out";
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isActive = (href: string) => href === "/showdown"
    ? pathname === href || (pathname.startsWith(`${href}/`) && !pathname.startsWith("/showdown/leaderboard"))
    : pathname === href || pathname.startsWith(`${href}/`);
  const displayName = user?.full_name || user?.email?.split("@")[0] || "Engineer";

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#dce5dd]/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <Brand />

          {user && (
            <div className="hidden items-center gap-1 xl:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${active ? "bg-[#e9f3e9] text-[#145d35]" : "text-[#657169] hover:bg-[#f3f6f1] hover:text-[#23432e]"}`}>
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="hidden items-center gap-2 xl:flex">
            {!loading && (user ? (
              <>
                <div className="mr-1 flex items-center gap-2.5 rounded-xl border border-[#dfe7df] bg-[#f7f9f6] px-3 py-1.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#dcebdd] text-[#17643a]"><User className="h-3.5 w-3.5" /></span>
                  <div className="max-w-[130px] leading-tight">
                    <p className="truncate text-xs font-bold text-[#294433]">{displayName}</p>
                    <p className="text-[10px] font-medium text-[#829087]">Student workspace</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-xl text-[#7a867e] transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : !isAuthPage ? (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-[#405548] hover:text-[#17643a]">Sign in</Link>
                <Link href="/signup" className="btn-primary min-h-10 px-5 py-2 text-sm">Get started</Link>
              </>
            ) : null)}
          </div>

          <button onClick={() => setMobileOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-xl border border-[#dfe7df] bg-[#f7f9f6] text-[#294433] xl:hidden" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 top-[72px] z-40 xl:hidden">
          <button className="absolute inset-0 h-full w-full bg-[#10251a]/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <aside className="absolute bottom-0 right-0 top-0 w-full max-w-sm overflow-y-auto border-l border-[#dfe7df] bg-[#f8faf7] p-4 shadow-2xl">
            {user ? (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#173d28] p-4 text-white">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><User className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{displayName}</p>
                    <p className="truncate text-xs text-white/60">{user.email}</p>
                  </div>
                </div>
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#89958d]">Workspace</p>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-[#e3efe4] text-[#145d35]" : "text-[#526158] hover:bg-white"}`}>
                        <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-white" : "bg-[#edf2ec]"}`}><Icon className="h-4 w-4" /></span>
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>
                    );
                  })}
                </div>
                <button onClick={handleLogout} className="mt-5 flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col justify-between py-2">
                <div>
                  <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#89958d]">Welcome to AgriSim</p>
                  <p className="px-2 text-sm leading-6 text-[#66736a]">Your intelligent study workspace for agricultural and environmental engineering.</p>
                </div>
                <div className="space-y-3">
                  <Link href="/login" className="btn-secondary w-full">Sign in</Link>
                  <Link href="/signup" className="btn-primary w-full">Create free account</Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
      <div className="h-[72px]" />
    </>
  );
}
