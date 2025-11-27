// src/components/problems/ProblemsPage.tsx
import { useEffect, useState } from "react";
import { Search, Filter, SortAsc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { problemsAPI, submissionsAPI } from "../../lib/api";
import ProblemCard from "./ProblemCard";
import FilterPanel from "./FilterPanel";

type ProblemsPageProps = {
  onNavigate?: (page: string, data?: any) => void;
};

type StatusType = "all" | "solved" | "attempted" | "todo";

export default function ProblemsPage({ onNavigate }: ProblemsPageProps) {
  const [problems, setProblems] = useState<any[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<any[]>([]);
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

  // status of each problem based on submissions: { problemId: "solved" | "attempted" }
  const [statusMap, setStatusMap] = useState<Record<string, "solved" | "attempted">>({});

  const navigate = useNavigate();

  // ---------- Fetch user submissions once, build status map ----------
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissions = await submissionsAPI.getSubmissionsByUser();

        const map: Record<string, "solved" | "attempted"> = {};

        submissions.forEach((s: any) => {
          const problemId =
            s.problem?._id || s.problem?._id?.toString?.() || s.problem?.toString?.();
          if (!problemId) return;

          const verdict = String(s.verdict || s.status || "").toLowerCase();
          if (verdict === "accepted") {
            map[problemId] = "solved"; // solved beats attempted
          } else if (!map[problemId]) {
            map[problemId] = "attempted";
          }
        });

        setStatusMap(map);
      } catch (err) {
        console.error("Error fetching submissions for status map:", err);
      }
    };

    fetchSubmissions();
  }, []);

  // ---------- Fetch problems from backend when filters/search/sort change (except status) ----------
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const params: any = {};

        if (filters.difficulty !== "all") {
          params.difficulty =
            filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1);
        }

        if (filters.category !== "all") {
          params.category = filters.category;
        }

        if (filters.tags.length > 0) {
          params.tags = filters.tags.join(",");
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const sortMap: Record<string, string> = {
          title: "title",
          difficulty: "difficulty",
          acceptance: "problemNumber", // backend doesn’t expose acceptance_rate in list
          submissions: "problemNumber", // same here
        };

        params.sortBy = sortMap[sortBy] || "problemNumber";
        params.order = "asc";

        const response = await problemsAPI.getProblems(params);

        const transformed = response.results.map((p: any) => ({
          id: p._id || p.problemNumber?.toString(),
          _id: p._id,
          problemNumber: p.problemNumber,
          title: p.title,
          difficulty: (p.difficulty || "medium").toLowerCase(),
          category: p.category || "general",
          tags: p.tags || [],
          description: p.description || "",
          // list endpoints currently don’t send these; keep 0 / undefined
          acceptance_rate: p.acceptance_rate,
          total_submissions: p.total_submissions,
          total_accepted: p.total_accepted,
        }));

        setProblems(transformed);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [filters.difficulty, filters.category, filters.tags, searchQuery, sortBy]);

  // ---------- Apply status filter client-side ----------
  useEffect(() => {
    let list = [...problems];

    if (filters.status !== "all") {
      list = list.filter((p) => {
        const key = p._id || p.id || p.problemNumber;
        const status = statusMap[String(key)];

        if (filters.status === "todo") {
          // no submissions at all
          return !status;
        }
        return status === filters.status;
      });
    }

    setFilteredProblems(list);
  }, [problems, filters.status, statusMap]);

  const handleOpenProblem = (problem: any) => {
    if (onNavigate) {
      onNavigate("problem", problem);
    } else {
      const id = problem.id || problem._id || problem.problemNumber;
      navigate(`/problem/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Problems</h1>
          <p className="text-gray-400">Practice and master your coding skills</p>
        </div>

        {/* Top controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border transition-all ${
                showFilters
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="title">Sort by Title</option>
                <option value="difficulty">Sort by Difficulty</option>
                <option value="acceptance">Sort by Acceptance</option>
                <option value="submissions">Sort by Submissions</option>
              </select>
              <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {showFilters && (
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              allProblems={problems}
            />
          )}
        </div>

        {/* Problems list */}
        <div className="grid grid-cols-1 gap-4">
          {filteredProblems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg">
                No problems found matching your criteria
              </p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <ProblemCard
                key={problem.id || problem._id || problem.problemNumber}
                problem={problem}
                onClick={() => handleOpenProblem(problem)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
