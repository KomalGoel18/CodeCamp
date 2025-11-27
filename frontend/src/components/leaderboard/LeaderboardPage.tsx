// frontend/src/components/leaderboard/LeaderboardPage.tsx
import { useEffect, useState } from "react";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { leaderboardAPI } from "../../lib/api";

type LeaderboardRow = {
  username: string;
  rank: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await leaderboardAPI.getLeaderboard();

        const normalized: LeaderboardRow[] = data.map((u, index) => {
          const diffObj =
            u.solvedByDifficulty ??
            u.solved_by_difficulty ?? {
              easy: u.easySolved,
              medium: u.mediumSolved,
              hard: u.hardSolved,
            };

          const easy = diffObj?.easy ?? 0;
          const medium = diffObj?.medium ?? 0;
          const hard = diffObj?.hard ?? 0;

          const totalFromDiff = easy + medium + hard;

          return {
            username:
              u.username ??
              u.user?.username ??
              u.email ??
              "Unknown",

            // if backend sends rank, use it; otherwise derive from index
            rank: u.rank ?? index + 1,

            totalSolved:
              u.totalSolved ??
              u.total_solved ??
              totalFromDiff,

            easySolved: easy,
            mediumSolved: medium,
            hardSolved: hard,
          };
        });

        setRows(normalized);
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError(err?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-400">
              See how you stack up against other coders
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-3 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">
              Top performers globally
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              No leaderboard data available yet.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Solved
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Easy
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Medium
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Hard
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {rows.map((row, index) => (
                  <tr
                    key={row.username + row.rank}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      <div className="flex items-center">
                        {index === 0 && (
                          <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
                        )}
                        {index === 1 && (
                          <Medal className="w-4 h-4 text-gray-300 mr-2" />
                        )}
                        {index === 2 && (
                          <Medal className="w-4 h-4 text-amber-700 mr-2" />
                        )}
                        #{row.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {row.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-100">
                      {row.totalSolved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-400">
                      {row.easySolved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-yellow-400">
                      {row.mediumSolved}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-400">
                      {row.hardSolved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
