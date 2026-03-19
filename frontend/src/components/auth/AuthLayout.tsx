import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Flag } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  prompt?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function AuthLayout({
  children,
  prompt,
  actionLabel,
  actionHref = "/login",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Subtle emerald glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.12), transparent)",
        }}
      />

      <header className="relative flex items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
            <Flag className="w-4 h-4 text-white" />
          </div>
          SolveOn
        </Link>
        {prompt && actionLabel && (
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{prompt}</span>
            <Link
              to={actionHref}
              className="px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm font-medium"
            >
              {actionLabel}
            </Link>
          </div>
        )}
      </header>

      <main className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="relative py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SolveOn. All rights reserved.
      </footer>
    </div>
  );
}
