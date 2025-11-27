// frontend/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";

import Navbar from "./components/layout/Navbar";
import Dashboard from "./components/dashboard/Dashboard";
import ProblemsPage from "./components/problems/ProblemsPage";
import ProblemDetailPage from "./components/problems/ProblemDetailPage";
import LeaderboardPage from "./components/leaderboard/LeaderboardPage";

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      {/* Navbar will use react-router navigate if onNavigate not provided */}
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem/:id" element={<ProblemDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        {/* Protected App */}
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </AuthProvider>
  );
}
