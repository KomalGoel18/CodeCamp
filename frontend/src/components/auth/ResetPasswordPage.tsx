import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import AuthLayout from "./AuthLayout";
import StyledInput from "../ui/StyledInput";
import GlassCard from "../ui/GlassCard";

interface ResetPasswordPageProps {
  onBack?: () => void;
}

export default function ResetPasswordPage({ onBack }: ResetPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    setResetUrl(null);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const res = await forgotPassword(email);
      if (res.resetUrl) {
        setResetUrl(res.resetUrl);
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout prompt="Remember your password?" actionLabel="Login" actionHref="/login">
      <GlassCard className="p-8 shadow-glow border-gray-700/50">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <RefreshCw className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h2>
        <p className="text-gray-400 text-center mb-6">
          Don't worry, it happens to the best of us. Enter the email address associated with your SolveOn account and we'll send you a link to get back to coding.
        </p>

        {success ? (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm mb-6">
              Check your email for a password reset link!
            </div>
            {resetUrl && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">Dev reset link (SMTP not configured):</p>
                <a href={resetUrl} className="text-emerald-400 underline" target="_blank" rel="noreferrer">
                  {resetUrl}
                </a>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}

            <StyledInput
              label="Email Address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </form>
        )}

        <Link
          to="/login"
          onClick={(e) => {
            if (onBack) {
              e.preventDefault();
              onBack();
            }
          }}
          className="flex items-center justify-center gap-2 mt-6 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <p className="text-xs text-gray-500 text-center mt-6">
          If you don't receive an email within a few minutes, please check your spam folder or{" "}
          <Link to="/support" className="text-emerald-400 hover:text-emerald-300">contact support</Link>.
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
