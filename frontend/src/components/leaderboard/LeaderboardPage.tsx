import { useEffect, useState, useMemo } from "react";
import {
  Trophy,
  Users,
  BarChart3,
  FileUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { leaderboardAPI } from "../../lib/api";
import GlassCard from "../ui/GlassCard";
import StatCard from "../ui/StatCard";
import Badge from "../ui/Badge";
import { useAuth } from "../../contexts/AuthContext";

type LeaderboardRow = {
  username: string;
  rank: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
};

const PAGE_SIZE = 10;

const medalColor = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-orange-400";
  return "text-white";
};

export default function LeaderboardPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    averageSolved: 0,
    topSubmissions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [userRank, setUserRank] = useState<{ rank: number; percentile: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [data, statsData] = await Promise.all([
          leaderboardAPI.getLeaderboard(),
          leaderboardAPI.getLeaderboardStats(),
        ]);

        const arr = Array.isArray(data) ? data : [];

        const normalized: LeaderboardRow[] = arr.map((u: any, index: number) => {
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

        const computedAverage =
          normalized.length > 0
            ? Math.round(
                normalized.reduce((sum, r) => sum + r.totalSolved, 0) /
                  normalized.length
              )
            : 0;

        const computedTopSubmissions =
          normalized.length > 0
            ? Math.max(...normalized.map((r) => r.totalSolved))
            : 0;

        setRows(normalized);

        setStats({
          totalParticipants: statsData.totalParticipants ?? normalized.length,
          averageSolved: statsData.averageSolved ?? computedAverage,
          topSubmissions: statsData.topSubmissions ?? computedTopSubmissions,
        });

        // Get true rank from backend to avoid duplication
        if (user) {
          import("../../lib/api").then(({ dashboardAPI }) => {
            dashboardAPI.getDashboardData().then((dash) => {
              setUserRank({ rank: dash.rank, percentile: dash.percentile });
            }).catch(() => {});
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    return rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [rows, page]);

  const currentUserRank = userRank?.rank ?? null;
  const currentUserPercentile = userRank?.percentile ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-gray-400">See how you stack up against other coders.</p>
          </div>

          {currentUserRank != null && (
            <GlassCard className="p-6 min-w-[200px] border-gray-700/50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Global Rank
              </p>
              <p className="text-2xl font-bold text-emerald-400">#{currentUserRank}</p>

              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-2">
                Percentile
              </p>

              <p className="text-lg font-semibold text-white">
                Top {Math.max(currentUserPercentile ?? 0, 1)}%
              </p>
            </GlassCard>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants.toLocaleString()}
            icon={Users}
            variant="default"
          />

          <StatCard
            title="Avg. Problems Solved"
            value={stats.averageSolved}
            icon={BarChart3}
            variant="emerald"
          />

          <StatCard
            title="Top Solved Count"
            value={stats.topSubmissions.toLocaleString()}
            icon={FileUp}
            variant="default"
          />
        </div>

        <GlassCard className="overflow-hidden border-gray-700/50">
          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">No leaderboard data available yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Solved
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Easy
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Medium
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Hard
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-800">
                    {paginatedRows.map((row, idx) => {
                      const globalIdx = (page - 1) * PAGE_SIZE + idx;
                      const isTop = globalIdx === 0;

                      const isCurrentUser =
                        user &&
                        row.username.toLowerCase() ===
                          (user.username ?? "").toLowerCase();

                      return (
                        <tr
                          key={`${row.username}-${row.rank}`}
                          className={`transition-colors ${
                            isCurrentUser
                              ? "bg-emerald-500/5"
                              : "hover:bg-gray-800/30"
                          } ${isTop ? "bg-emerald-500/5" : ""}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {row.rank <= 3 && (
                                <Trophy className={`w-5 h-5 ${medalColor(row.rank)}`} />
                              )}

                              <span className={`font-semibold ${medalColor(row.rank)}`}>
                                #{row.rank}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-400">
                                {(row.username || "U").charAt(0).toUpperCase()}
                              </div>

                              <span className="text-white font-medium">
                                {row.username}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-white font-medium">
                            {row.totalSolved}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Badge variant="easy">{row.easySolved}</Badge>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Badge variant="medium">{row.mediumSolved}</Badge>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Badge variant="hard">{row.hardSolved}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-800 bg-gray-900/30">
                <p className="text-sm text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} coders
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}