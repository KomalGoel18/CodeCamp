// src/components/layout/Navbar.tsx
import { useAuth } from "../../contexts/AuthContext";

interface NavbarProps {
  currentPage?: string;
  onNavigate?: (page: string, data?: any) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps = {}) {
  const auth = useAuth();

  // If context not ready, show safe fallback
  const user = auth?.user ?? null;

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
      <div className="text-white font-bold text-lg">CodeCamp</div>
      <div className="flex items-center space-x-4">
        {/* optional navigation buttons (no visual change — small text buttons) */}
        {onNavigate && (
          <>
            <button
              className={`text-sm ${currentPage === "dashboard" ? "text-white" : "text-gray-400"}`}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`text-sm ${currentPage === "problems" ? "text-white" : "text-gray-400"}`}
              onClick={() => onNavigate("problems")}
            >
              Problems
            </button>
          </>
        )}
        <div>
          {user ? (
            <div className="text-gray-200">Hi {user.username || (user as any).name || user.email}</div>
          ) : (
            <a className="text-blue-400" href="/login">
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
