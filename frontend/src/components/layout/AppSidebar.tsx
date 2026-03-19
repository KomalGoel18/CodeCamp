import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Code2,
  Trophy,
  LogOut,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/problems", label: "Problems", icon: Code2 },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-gray-900/80 border-r border-gray-800 flex flex-col">
      <div
        className="flex items-center gap-2 p-6 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">SolveOn</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <p className="text-white font-semibold">{user?.username}</p>
          <p className="text-xs text-gray-400 mt-1">Keep solving daily 🚀</p>
        </div>

        <button
          onClick={() => {
            signOut();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}