import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Lock, Mail, User } from "lucide-react";
import AuthLayout from "./AuthLayout";
import StyledInput from "../ui/StyledInput";
import GlassCard from "../ui/GlassCard";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !username) {
      setError("Please fill in all required fields");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = (await signUp(username.trim(), email.trim(), password)) as { error?: { message?: string } } | void;
      if (res?.error) {
        setError(res.error.message || "Registration failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout prompt="Already a member?" actionLabel="Log in" actionHref="/login">
      <GlassCard className="p-8 shadow-glow border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-1">Join the community</h2>
        <p className="text-gray-400 mb-6">The all-in-one platform for coders.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
              {error}
            </div>
          )}

          <StyledInput
            label="Username"
            icon={<User className="w-5 h-5" />}
            placeholder="Choose a unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <StyledInput
            label="Email Address"
            type="email"
            icon={<Mail className="w-5 h-5" />}
            placeholder="Enter your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <StyledInput
            label="Password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <StyledInput
            label="Confirm Password"
            type="password"
            icon={<Lock className="w-5 h-5" />}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>


        </form>
      </GlassCard>
    </AuthLayout>
  );
}
