import { ReactNode } from "react";

type BadgeVariant = "easy" | "medium" | "hard" | "neutral" | "success" | "error" | "warning";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
  neutral: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
