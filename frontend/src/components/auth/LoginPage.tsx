import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "./AuthLayout";
import StyledInput from "../ui/StyledInput";
import GlassCard from "../ui/GlassCard";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email.trim(), password);
      setLoggedIn(true);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  if (loggedIn) {
    return (
      <AuthLayout>
        <GlassCard className="p-8 shadow-glow">
          <h2 className="text-2xl font-bold text-white mb-2">Signed in successfully</h2>
          <p className="text-gray-400 mb-6">You're now signed in. Click below to continue to your workspace.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 w-full justify-center bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </GlassCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout prompt="Don't have an account?" actionLabel="Create Account" actionHref="/register">
      <GlassCard className="p-8 shadow-glow border-gray-700/50">
        <h1 id="login-heading" className="text-2xl font-bold text-white mb-1">
          Welcome Back
        </h1>
        <p className="text-gray-400 mb-6">Sign in to your coding workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <StyledInput
            label="Email Address"
            type="email"
            icon={<Mail className="w-5 h-5" />}
            placeholder="dev@solveon.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <StyledInput
              type="password"
              icon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500/30"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300">Remember this device</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In to Dashboard"}
            <ArrowRight className="w-5 h-5" />
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake" role="alert">
              {error}
            </div>
          )}

        </form>
      </GlassCard>
    </AuthLayout>
  );
};

export default LoginPage;
