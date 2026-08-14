import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  meta?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, icon: Icon, meta, children }: PageHeaderProps) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-[#dbe6dc] bg-white px-5 py-7 shadow-[0_18px_50px_rgba(32,72,43,0.06)] sm:px-8 sm:py-9">
      <div className="app-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-[#dbeec8]/50 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="page-kicker">{Icon && <Icon className="h-4 w-4" />}{eyebrow}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
          {meta && <p className="mt-4 font-mono text-xs font-semibold text-green-700">{meta}</p>}
        </div>
        {children && <div className="relative shrink-0">{children}</div>}
      </div>
    </header>
  );
}
