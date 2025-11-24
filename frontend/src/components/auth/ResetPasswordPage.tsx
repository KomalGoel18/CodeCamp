// src/components/auth/ResetPasswordPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft, Code2 } from 'lucide-react';

interface ResetPasswordPageProps {
  onBack?: () => void;
}

export default function ResetPasswordPage({ onBack }: ResetPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth(); // use forgotPassword which calls /auth/forgot-password
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    setResetUrl(null);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const res = await forgotPassword(email);
      // res may include resetUrl and resetToken in dev fallback
      if (res.resetUrl) {
        setResetUrl(res.resetUrl);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzFmMjkzNyIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjMiLz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="w-full max-w-md relative">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <button
  onClick={() => { if (onBack) onBack(); else navigate('/login'); }}
  className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </button>

          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
              <Code2 className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-white">Reset Password</h2>
          <p className="text-gray-400 text-center mb-8">
            Enter your email address and we'll send you a link to reset your password
          </p>

          {success ? (
            <>
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
                Check your email for a password reset link!
              </div>
              {resetUrl && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 text-sm mb-2">Dev reset link (SMTP not configured):</p>
                  <a href={resetUrl} className="text-blue-400 underline" target="_blank" rel="noreferrer">
                    {resetUrl}
                  </a>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
