import { LucideIcon } from "lucide-react";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "emerald" | "accent";
  trend?: ReactNode;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  trend,
  subtitle,
}: StatCardProps) {
  const iconBg =
    variant === "emerald"
      ? "bg-emerald-500/20"
      : variant === "accent"
        ? "bg-emerald-500/10"
        : "bg-gray-700/50";
  const iconColor =
    variant === "emerald" || variant === "accent"
      ? "text-emerald-400"
      : "text-gray-400";
  const valueColor =
    variant === "emerald" ? "text-emerald-400" : "text-white";

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 hover:border-gray-700/80 transition-all group backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${iconBg} p-3 rounded-lg group-hover:scale-105 transition-transform ${iconColor}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-sm font-medium text-emerald-400">{trend}</span>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
