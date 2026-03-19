import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`
        bg-gray-900/80 border border-gray-800/80 rounded-xl
        backdrop-blur-sm shadow-xl shadow-black/20
        ${className}
      `}
    >
      {children}
    </div>
  );
}
