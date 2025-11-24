// frontend/src/components/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import { TrendingUp, Target, Flame, Trophy, Clock, CheckCircle2, Activity } from 'lucide-react';
import { dashboardAPI, submissionsAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';
import ActivityChart from './ActivityChart';
import RecentActivity from './RecentActivity';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalSubmissions: 0,
    acceptanceRate: 0,
    streak: 0,
    rank: 0,
    points: 0,
    activity: [] as Array<{ date: string; submissions?: number; solved?: number; value?: number }>,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back!');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch dashboard data from backend
      const dashboardData = await dashboardAPI.getDashboardData();
      
      // Fetch recent submissions
      const submissions = await submissionsAPI.getSubmissionsByUser();

      setWelcomeMessage(dashboardData.welcomeMessage || `Welcome back, ${user.username}!`);
      
      // count accepted submissions (case-insensitive)
      const accepted = submissions.filter((s: any) => String(s.verdict || s.status || '').toLowerCase() === 'accepted').length;
      const total = submissions.length;
      
      setStats((prev) => ({
        ...prev,
        problemsSolved: dashboardData.totalSolved ?? dashboardData.totalSolved ?? 0,
        totalSubmissions: dashboardData.totalSubmissions ?? total ?? 0,
        acceptanceRate: typeof dashboardData.acceptanceRate !== 'undefined'
          ? dashboardData.acceptanceRate
          : (total > 0 ? Math.round((accepted / total) * 100) : 0),
        streak: dashboardData.currentStreak ?? dashboardData.current_streak ?? 0,
        rank: dashboardData.rank ?? 0,
        points: dashboardData.points ?? 0,
        activity: dashboardData.activity ?? [],
      }));

      // Transform submissions to match expected format
      const transformedSubmissions = submissions.slice(0, 10).map((sub: any) => ({
        id: sub._id,
        problem_id: sub.problem?._id || sub.problem,
        language: sub.language,
        status: (sub.verdict || sub.status || '').toLowerCase() || 'pending',
        runtime: sub.executionTime,
        memory: sub.memory,
        created_at: sub.createdAt || sub.created_at,
        problems: sub.problem ? {
          title: sub.problem.title,
          difficulty: sub.problem.difficulty,
        } : null,
      }));

      setRecentSubmissions(transformedSubmissions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {welcomeMessage}
          </h1>
          <p className="text-gray-400">Here's your coding progress overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Problems Solved"
            value={stats.problemsSolved}
            icon={CheckCircle2}
            color="blue"
          />
          <StatsCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            icon={Activity}
            color="cyan"
          />
          <StatsCard
            title="Acceptance Rate"
            value={`${stats.acceptanceRate}%`}
            icon={Target}
            color="green"
          />
          <StatsCard
            title="Current Streak"
            value={`${stats.streak} days`}
            icon={Flame}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Activity Overview</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                    7D
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    30D
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                    1Y
                  </button>
                </div>
              </div>
              {/* pass backend activity if present; fallback to recent submissions */}
              <ActivityChart data={stats.activity} submissions={recentSubmissions} />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Your Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Global Rank</p>
                    <p className="text-lg font-semibold text-white">#{stats.rank || 'Unranked'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-500/10 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Points</p>
                    <p className="text-lg font-semibold text-white">{stats.points}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/10 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Avg. Time</p>
                    <p className="text-lg font-semibold text-white">24m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecentActivity submissions={recentSubmissions} />
      </div>
    </div>
  );
}
