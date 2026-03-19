import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import HomePage from "./components/home/HomePage";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/dashboard/Dashboard";
import ProblemsPage from "./components/problems/ProblemsPage";
import ProblemDetailPage from "./components/problems/ProblemDetailPage";
import LeaderboardPage from "./components/leaderboard/LeaderboardPage";
import RecentActivity from "./components/dashboard/RecentActivity";
import ProfilePage from "./components/profile/ProfilePage";

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem/:id" element={<ProblemDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/submissions" element={<RecentActivity submissions={[]} />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </AuthProvider>
  );
}