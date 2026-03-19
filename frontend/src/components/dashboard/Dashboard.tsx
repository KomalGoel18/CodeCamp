import { useEffect, useState, useMemo } from "react";
import {
  Medal,
  Star,
  Flame,
  Share2,
  Calendar,
  ChevronUp,
} from "lucide-react";
import { dashboardAPI, submissionsAPI, usersAPI } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "../ui/StatCard";
import GlassCard from "../ui/GlassCard";
import ActivityHeatmap from "./ActivityHeatmap";
import DonutChart from "./DonutChart";
import RecentActivity from "./RecentActivity";

interface SubmissionItem {
  createdAt?: string | number;
  created_at?: string | number;
  problem?: { title?: string; difficulty?: string };
  problems?: { title?: string; difficulty?: string };
  verdict?: string;
  status?: string;
  executionTime?: number;
  runtime?: number;
  _id?: string;
  id?: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<{ createdAt?: string; email?: string } | null>(null);

  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalSubmissions: 0,
    acceptanceRate: 0,
    streak: 0,
    personalBestStreak: 0,
    rank: 0,
    percentile: 0,
    points: 0,
    difficultySummary: { easy: 0, medium: 0, hard: 0 },
    problemTotals: { easy: 1, medium: 1, hard: 1, total: 3 },
    activity: [] as Array<{ date: string; value: number }>,
  });

  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    if (hour < 21) return "Good Evening 🌙";
    return "Welcome Back ✨";
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardData, submissions, myProfile] = await Promise.all([
        dashboardAPI.getDashboardData(),
        submissionsAPI.getSubmissionsByUser(),
        usersAPI.getMyProfile().catch(() => null),
      ]);

      if (myProfile) setProfile(myProfile);

      setStats({
        problemsSolved: dashboardData.totalSolved,
        totalSubmissions: dashboardData.totalSubmissions,
        acceptanceRate: dashboardData.acceptanceRate,
        streak: dashboardData.currentStreak,
        personalBestStreak: dashboardData.personalBestStreak,
        rank: dashboardData.rank,
        percentile: dashboardData.percentile,
        points: dashboardData.points,
        difficultySummary: dashboardData.difficultySummary,
        problemTotals: dashboardData.problemTotals,
        activity: dashboardData.activity,
      });

      setRecentSubmissions(submissions.slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  const activityForHeatmap = useMemo(() => stats.activity, [stats.activity]);

  const joinedDate = profile?.createdAt ? new Date(profile.createdAt) : new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-3xl font-bold text-white">
            {getGreeting()}, {user?.username}
          </p>
          <p className="text-gray-400 mt-1">Ready to solve more problems today?</p>
        </div>
      </div>

      <GlassCard className="p-6 mb-8 border-gray-700/50">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.username}&background=111827&color=10b981`}
                alt="profile"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
              <div className="text-gray-400 text-sm">{user?.email}</div>
              <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                <Calendar className="w-4 h-4" />
                Joined {joinedDate.toLocaleString("default", { month: "long" })}{" "}
                {joinedDate.getFullYear()}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const profileUrl = `${window.location.origin}/profile/${user?.username}`;
                navigator.clipboard.writeText(profileUrl);
                alert("Profile link copied 🚀");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800/50"
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Global Rank"
          value={`#${stats.rank}`}
          icon={Medal}
          trend={
            <span className="flex items-center gap-1 text-emerald-400">
              <ChevronUp className="w-4 h-4" />
              Top {Math.max(stats.percentile, 1)}%
            </span>
          }
        />

        <StatCard
          title="Total Points"
          value={stats.points}
          icon={Star}
          subtitle={`${stats.totalSubmissions} submissions`}
          variant="emerald"
        />

        <StatCard
          title="Current Streak"
          value={`${stats.streak} Days`}
          icon={Flame}
          subtitle={`Best: ${stats.personalBestStreak} Days`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6 border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-4">Activity Overview</h2>
          <ActivityHeatmap activity={activityForHeatmap} />
        </GlassCard>

        <GlassCard className="p-6 border-gray-700/50">
          <h2 className="text-lg font-bold text-white mb-4">Acceptance Rate</h2>
          <DonutChart value={stats.problemsSolved} total={stats.totalSubmissions || 1} label="" />
        </GlassCard>
      </div>

      <GlassCard className="p-6 border-gray-700/50">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        </div>

        <RecentActivity compact submissions={recentSubmissions} />
      </GlassCard>
    </div>
  );
}