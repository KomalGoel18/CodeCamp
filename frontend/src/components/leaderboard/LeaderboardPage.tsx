import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Clock } from 'lucide-react';
import { leaderboardAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      const data = await leaderboardAPI.getLeaderboard();
      
      // Transform backend data to match frontend format
      const rankedData = data.map((profile, index) => ({
        id: profile._id || index.toString(),
        username: profile.username || 'Anonymous',
        problems_solved: profile.totalSolved || 0,
        points: profile.totalSolved || 0, // Use totalSolved as points for now
        streak_days: 0, // Backend doesn't provide streak yet
        rank: index + 1,
        solvedByDifficulty: profile.solvedByDifficulty || {},
      }));
      
      setLeaderboard(rankedData);

      if (user) {
        const currentUser = rankedData.find((p) => p.username === user.username);
        if (currentUser) {
          setUserRank(currentUser.rank);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (rank: number) => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Champion' };
    if (rank === 2) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-500/10', label: 'Runner-up' };
    if (rank === 3) return { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Third Place' };
    if (rank <= 10) return { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Top 10' };
    return null;
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
              <p className="text-gray-400">See how you rank against other coders</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === 'all'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === 'month'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === 'week'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                This Week
              </button>
            </div>
          </div>

          {userRank && (
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">Your Rank</p>
                    <p className="text-gray-400 text-sm">Keep climbing!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-400">#{userRank}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboard.slice(0, 3).map((profile, index) => {
            const badge = getBadge(index + 1);
            if (!badge) return null;
            const Icon = badge.icon;

            return (
              <div
                key={profile.id}
                className={`bg-gray-900 border-2 rounded-xl p-6 text-center transform hover:scale-105 transition-all ${
                  index === 0 ? 'border-yellow-500/30' :
                  index === 1 ? 'border-gray-500/30' :
                  'border-orange-500/30'
                }`}
              >
                <div className={`${badge.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 ${badge.color}`} />
                </div>
                <div className="mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{profile.username || 'Anonymous'}</h3>
                  <p className={`text-sm font-semibold ${badge.color}`}>{badge.label}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Points</span>
                    <span className="text-white font-semibold">{profile.points.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Solved</span>
                    <span className="text-white font-semibold">{profile.problems_solved}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Streak</span>
                    <span className="text-orange-400 font-semibold">{profile.streak_days} days</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Solved
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Streak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Badge
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.map((profile) => {
                  const badge = getBadge(profile.rank);
                  const isCurrentUser = user?.username === profile.username;

                  return (
                    <tr
                      key={profile.id}
                      className={`hover:bg-gray-800/50 transition-colors ${
                        isCurrentUser ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${
                            profile.rank === 1 ? 'text-yellow-400' :
                            profile.rank === 2 ? 'text-gray-300' :
                            profile.rank === 3 ? 'text-orange-400' :
                            'text-gray-400'
                          }`}>
                            #{profile.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {profile.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className={`font-medium ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                              {profile.username || 'Anonymous'}
                              {isCurrentUser && ' (You)'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">{(profile.points || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-300">{profile.problems_solved || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">{profile.streak_days || 0} days</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {badge && (
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full ${badge.bg}`}>
                            <badge.icon className={`w-4 h-4 ${badge.color}`} />
                            <span className={`text-xs font-semibold ${badge.color}`}>{badge.label}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
