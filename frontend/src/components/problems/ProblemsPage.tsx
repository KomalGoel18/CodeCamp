import { useEffect, useState, useMemo } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { problemsAPI, submissionsAPI } from "../../lib/api";
import ProblemCard from "./ProblemCard";
import FilterPanel from "./FilterPanel";
import GlassCard from "../ui/GlassCard";
import PageHeader from "../ui/PageHeader";

type ProblemsPageProps = {
  onNavigate?: (page: string, data?: unknown) => void;
};

type StatusType = "all" | "solved" | "attempted" | "todo";

type ProblemType = {
  id: number;
  _id?: string;
  problemNumber: number;
  title: string;
  difficulty: string;
  category: string;
  tags: string[];
  description: string;
  acceptance_rate?: number;
  total_submissions?: number;
  total_accepted?: number;
};

export default function ProblemsPage({ onNavigate }: ProblemsPageProps) {
  const [problems, setProblems] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<{
    difficulty: "all" | "easy" | "medium" | "hard";
    category: string | "all";
    status: StatusType;
    tags: string[];
  }>({
    difficulty: "all",
    category: "all",
    status: "all",
    tags: [],
  });

  const [sortBy, setSortBy] = useState<"title" | "difficulty" | "acceptance" | "submissions">(
    "title"
  );

  const [statusMap, setStatusMap] = useState<Record<string, "solved" | "attempted">>({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissions = await submissionsAPI.getSubmissionsByUser();

        const map: Record<string, "solved" | "attempted"> = {};

        submissions.forEach((s: any) => {
          const problemId = s.problem?._id || s.problem;

          if (!problemId) return;

          const verdict = String(s.verdict || s.status || "").toLowerCase();

          if (verdict === "accepted") {
            map[String(problemId)] = "solved";
          } else if (!map[String(problemId)]) {
            map[String(problemId)] = "attempted";
          }
        });

        setStatusMap(map);
      } catch {
        // ignore safely
      }
    };

    fetchSubmissions();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);

      try {
        const params: Record<string, string> = {};

        if (filters.difficulty !== "all") {
          params.difficulty =
            filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1);
        }

        if (filters.category !== "all") params.category = filters.category;

        if (filters.tags.length > 0) {
          params.tags = filters.tags.join(",");
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const sortMap: Record<string, string> = {
          title: "title",
          difficulty: "difficulty",
          acceptance: "total_accepted",
          submissions: "total_submissions",
        };

        params.sortBy = sortMap[sortBy] ?? "problemNumber";
        params.order = "asc";

        const response = await problemsAPI.getProblems(params);

        const transformed: ProblemType[] = response.results.map((p: any) => ({
          id: p.problemNumber,
          _id: p._id,
          problemNumber: p.problemNumber,
          title: p.title,
          difficulty: String(p.difficulty ?? "medium").toLowerCase(),
          category: p.category ?? "general",
          tags: p.tags ?? [],
          description: p.description ?? "",
          acceptance_rate: p.acceptance_rate ?? 0,
          total_submissions: p.total_submissions ?? 0,
          total_accepted: p.total_accepted ?? 0,
        }));

        setProblems(transformed);
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [filters.difficulty, filters.category, filters.tags, searchQuery, sortBy]);

  const filteredProblems = useMemo(() => {
    let list = [...problems];

    if (filters.status !== "all") {
      list = list.filter((p) => {
        const key = String(p._id ?? p.problemNumber);
        const status = statusMap[key];

        if (filters.status === "todo") return !status;

        return status === filters.status;
      });
    }

    return list;
  }, [problems, filters.status, statusMap]);

  const handleOpenProblem = (problem: ProblemType) => {
    if (onNavigate) {
      onNavigate("problem", problem);
    } else {
      navigate(`/problem/${problem.problemNumber}`);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      difficulty: "all",
      category: "all",
      status: "all",
      tags: [],
    });

    setSearchQuery("");
  };

  const hasActiveFilters =
    filters.difficulty !== "all" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.tags.length > 0 ||
    searchQuery !== "";

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
        <PageHeader
          title="Problems"
          subtitle="Practice and master your coding skills"
        />

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all ${
              showFilters
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-gray-900/80 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as typeof sortBy)
              }
              className="appearance-none w-full min-w-[180px] bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              <option value="title">Sort by Title</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="acceptance">Sort by Acceptance</option>
              <option value="submissions">Sort by Submissions</option>
            </select>

            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {showFilters && (
          <GlassCard className="p-6 mb-6 border-gray-700/50">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              allProblems={problems}
            />
          </GlassCard>
        )}

        <GlassCard className="p-6 min-h-[400px] border-gray-700/50">
          {filteredProblems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-800/80 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-500" />
              </div>

              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No problems found matching your criteria
              </h3>

              <p className="text-gray-500 text-center mb-6 max-w-md">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProblems.map((problem) => (
                <ProblemCard
                  key={problem.problemNumber}
                  problem={problem}
                  onClick={() => handleOpenProblem(problem)}
                />
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}