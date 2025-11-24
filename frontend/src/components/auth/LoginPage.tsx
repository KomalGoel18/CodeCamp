// src/components/auth/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // only call signIn once
      await signIn(email.trim(), password);
      setLoggedIn(true);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError((err && (err.message ?? String(err))) ?? "Login failed");
    }
  };

  if (loggedIn) {
    return (
      <div className="lp-wrapper">
        <div className="lp-card">
          <h2 className="lp-title">Signed in successfully</h2>
          <p className="lp-sub">You're now signed in. Click below to continue to your workspace.</p>
          <Link to="/dashboard" className="lp-cta">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-wrapper">
      <div className="lp-card" role="region" aria-labelledby="login-heading">
        <header className="lp-header">
          <h1 id="login-heading" className="lp-title">Welcome back</h1>
          <p className="lp-sub">Sign in to continue to your account</p>
        </header>

        <form onSubmit={handleSubmit} className="lp-form" noValidate>
          <label htmlFor="email" className="lp-label">
            Email
            <input
              id="email"
              name="email"
              type="email"
              className="lp-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
            />
          </label>

          <label htmlFor="password" className="lp-label">
            Password
            <input
              id="password"
              name="password"
              type="password"
              className="lp-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
            />
          </label>

          <div className="lp-row">
            <button type="submit" className="lp-button" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <Link to="/forgot-password" className="lp-forgot" aria-label="Forgot password">
              Forgot?
            </Link>
          </div>

          {error && (
            <div className="lp-error" role="alert">
              {error}
            </div>
          )}

          <div className="lp-footer-note">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
