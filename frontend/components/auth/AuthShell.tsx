import Image from "next/image";
import { CheckCircle2, Sprout } from "lucide-react";
import Brand from "@/frontend/components/layout/Brand";

interface AuthShellProps {
  title: string;
  subtitle: string;
  eyebrow: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, eyebrow, children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-[#f5f7f2] lg:grid-cols-[1.05fr_.95fr]">
      <aside className="relative hidden min-h-screen overflow-hidden lg:block">
        <Image src="/images/agrienv-hero.png" alt="Modern irrigated agricultural research fields" fill priority sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,50,28,.28),rgba(13,50,28,.92))]" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <Brand inverted />
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur-md"><Sprout className="h-3.5 w-3.5 text-[#c5df7d]" />Engineering knowledge, brought to life</span>
            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.045em] xl:text-5xl">Your intelligent workspace for agricultural engineering.</h2>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/70">
              {["Interactive models", "AI-guided revision", "Live group challenges"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#c5df7d]" />{item}</span>)}
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[470px]">
          <div className="mb-9 lg:hidden"><Brand /></div>
          <div className="mb-7">
            <p className="page-kicker">{eyebrow}</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#173221] sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-[#6f7c73]">{subtitle}</p>
          </div>
          {children}
          <p className="mt-7 text-center text-[11px] leading-5 text-[#8a968e]">By continuing, you agree to use AgriEnv responsibly as an academic learning tool.</p>
        </div>
      </section>
    </main>
  );
}
