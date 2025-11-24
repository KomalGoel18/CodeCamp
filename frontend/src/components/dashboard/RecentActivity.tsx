// frontend/src/components/dashboard/RecentActivity.tsx
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface ProblemLite {
  _id?: string;
  title?: string;
  difficulty?: string;
}

interface SubmissionItem {
  id?: string;
  _id?: string;
  problem?: ProblemLite;
  problems?: ProblemLite; // support both shapes you might have
  language?: string;
  verdict?: string; // backend uses 'verdict'
  status?: string; // legacy / alternate
  runtime?: number;
  executionTime?: number;
  createdAt?: string | number;
  created_at?: string | number;
}

interface RecentActivityProps {
  submissions: SubmissionItem[];
}

const statusConfig = {
  accepted: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    label: "Accepted",
  },
  wrong_answer: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Wrong Answer",
  },
  time_limit_exceeded: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    label: "Time Limit",
  },
  runtime_error: {
    icon: AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    label: "Runtime Error",
  },
  compilation_error: {
    icon: AlertCircle,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    label: "Compilation Error",
  },
  pending: {
    icon: Clock,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    label: "Pending",
  },
  internal_error: {
    icon: AlertCircle,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    label: "Internal Error",
  },
} as const;

type StatusKey = keyof typeof statusConfig;

const difficultyColors = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
} as const;

export default function RecentActivity({ submissions }: RecentActivityProps) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="text-center py-12">
          <p className="text-gray-400">No submissions yet. Start solving problems!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
      <div className="space-y-3">
        {submissions.map((submission, idx) => {
          // verdict may live in `verdict` or `status`. Prefer 'verdict'.
          const rawStatus = (submission.verdict || submission.status || "pending").toString();
          // normalize e.g. "Wrong Answer" -> "wrong_answer"
          const statusKey = (rawStatus || "pending").toLowerCase().replace(/\s+/g, "_") as StatusKey;
          const config = statusConfig[statusKey] || statusConfig.pending;
          const Icon = config.icon;
          const problem = submission.problem || submission.problems || {};

          const created = submission.createdAt || submission.created_at;
          const createdDate = created ? new Date(created).toLocaleDateString() : "—";

          const runtime = submission.executionTime ?? submission.runtime ?? null;

          return (
            <div
              key={submission._id || submission.id || idx}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all group"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`${config.bg} p-2 rounded-lg border ${config.border}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                    {problem?.title || "Unknown Problem"}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span
                      className={`text-xs font-semibold ${
                        difficultyColors[(problem?.difficulty || "").toLowerCase() as keyof typeof difficultyColors] ||
                        "text-gray-400"
                      }`}
                    >
                      {(problem?.difficulty || "N/A").toString().toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
                  {runtime !== null && <p className="text-xs text-gray-500">{runtime} ms</p>}
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{submission.language || "N/A"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
