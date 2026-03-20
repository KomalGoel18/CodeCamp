import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../lib/api";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await authAPI.forgotPassword(email);

      setSuccess(res.message || "Reset link sent successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 px-6 md:px-10 py-4 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 text-emerald-500">
            <svg fill="none" viewBox="0 0 48 48">
              <path
                d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">SolveOn</h2>
        </div>

        <Link
          to="/login"
          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold"
        >
          Login
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="max-w-[480px] w-full bg-white/[0.03] border border-white/10 rounded-xl p-8 shadow-2xl backdrop-blur-md relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="text-emerald-500 text-4xl">🔒</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Reset Password</h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Enter your email address and we’ll send you a password reset link.
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block pb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg h-14 bg-white/5 border border-white/10 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              to="/login"
              className="text-slate-400 hover:text-white text-sm"
            >
              ← Back to login
            </Link>

            <div className="w-full border-t border-white/5 pt-6 mt-2">
              <p className="text-slate-500 text-xs text-center leading-relaxed">
                If you don't receive an email, check spam folder.
              </p>
            </div>
          </div>
        </div>

        {/* Background Glow */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[140px]" />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-slate-600 text-xs">
          © 2026 SolveOn. All rights reserved.
        </p>
      </footer>
    </div>
  );
}