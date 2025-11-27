// src/components/layout/Navbar.tsx
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  currentPage?: string;
  onNavigate?: (page: string, data?: any) => void;
};

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const go = (page: string) => {
    if (onNavigate) onNavigate(page);
    else {
      // router paths used by the app
      switch (page) {
        case "dashboard":
          navigate("/dashboard");
          break;
        case "problems":
          navigate("/problems");
          break;
        case "leaderboard":
          navigate("/leaderboard");
          break;
        default:
          navigate("/");
      }
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center space-x-6">
        <div className="text-white font-bold text-lg cursor-pointer" onClick={() => go("dashboard")}>
          CodeCamp
        </div>

        {/* Navigation links - visually subtle, won't disturb your UI */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <button
            onClick={() => go("dashboard")}
            className={`px-3 py-1 rounded ${currentPage === "dashboard" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
          >
            Dashboard
          </button>

          <button
            onClick={() => go("problems")}
            className={`px-3 py-1 rounded ${currentPage === "problems" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
          >
            Problems
          </button>

          <button
            onClick={() => go("leaderboard")}
            className={`px-3 py-1 rounded ${currentPage === "leaderboard" ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-200">Hi {user.username ?? user.email}</span>
            <button
              onClick={() => { signOut(); navigate("/login"); }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Sign out
            </button>
          </div>
        ) : (
          <a className="text-blue-400" href="/login">
            Login
          </a>
        )}
      </div>
    </nav>
  );
}
