import Link from "next/link";
import { Sprout } from "lucide-react";

interface BrandProps {
  inverted?: boolean;
  compact?: boolean;
}

export default function Brand({ inverted = false, compact = false }: BrandProps) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="AgriEnv home">
      <span className={`relative grid h-10 w-10 place-items-center overflow-hidden rounded-[0.9rem] transition-transform duration-200 group-hover:-rotate-3 ${inverted ? "bg-white text-green-900" : "bg-[#155c35] text-white"}`}>
        <span className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full bg-[#b8d767]/70" />
        <Sprout className="relative h-5 w-5" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className={`text-xl font-bold tracking-[-0.035em] ${inverted ? "text-white" : "text-[#17331f]"}`}>
          Agri<span className={inverted ? "text-[#c4df7b]" : "text-[#27784a]"}>Env</span>
        </span>
      )}
    </Link>
  );
}
