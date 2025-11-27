// frontend/src/components/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Target, Flame, Trophy, CheckCircle2, Activity } from 'lucide-react';
import { dashboardAPI, submissionsAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';
//import ActivityChart from './ActivityChart';
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
  const [range, setRange] = useState<'7D' | '30D' | '1Y'>('7D');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // refetch whenever user or range changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, range]);

  const fetchDashboardData = async () => {
  if (!user) return;

  try {
    // 1) Dashboard numbers directly from backend (with range)
    const dashboardData = await dashboardAPI.getDashboardData({ range });

    // 2) Submissions only for recent activity list & chart fallback
    const submissions = await submissionsAPI.getSubmissionsByUser();

    setWelcomeMessage(
      dashboardData.welcomeMessage || `Welcome back, ${user.username}!`
    );

    setStats({
      problemsSolved: dashboardData.totalSolved,
      totalSubmissions: dashboardData.totalSubmissions,
      acceptanceRate: dashboardData.acceptanceRate,
      streak: dashboardData.currentStreak,
      rank: dashboardData.rank,
      points: dashboardData.points,
      activity: dashboardData.activity,
    });

    // Recent activity list (purely backend data, just reshaped)
    const transformedSubmissions = submissions.slice(0, 10).map((sub: any) => ({
      id: sub._id,
      problem_id: sub.problem?._id || sub.problem,
      language: sub.language,
      status: (sub.verdict || sub.status || '').toLowerCase() || 'pending',
      runtime: sub.executionTime,
      memory: sub.memory,
      created_at: sub.createdAt || sub.created_at,
      problems: sub.problem
        ? {
            title: sub.problem.title,
            difficulty: sub.problem.difficulty,
          }
        : null,
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

            </div>
          </div>
        </div>

        <div className="bg-gray-900border-gray-800 rounded-xl p-6">
  <RecentActivity submissions={recentSubmissions} />
</div>

      </div>
  );
}
