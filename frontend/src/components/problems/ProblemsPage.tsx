// src/components/problems/ProblemsPage.tsx
import { useEffect, useState } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { problemsAPI } from '../../lib/api';
import ProblemCard from './ProblemCard';
import FilterPanel from './FilterPanel';

export default function ProblemsPage({ onNavigate }: { onNavigate?: (page: string, data?: any) => void }) {
  const [problems, setProblems] = useState<any[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    status: 'all',
    tags: [] as string[],
  });
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    fetchProblems();
  }, [filters.difficulty, filters.category, filters.tags, searchQuery, sortBy]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [problems]);

  const fetchProblems = async () => {
    try {
      const params: any = {};
      
      if (filters.difficulty !== 'all') {
        params.difficulty = filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1);
      }
      
      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      
      if (filters.tags.length > 0) {
        params.tags = filters.tags.join(',');
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Map frontend sortBy to backend sortBy
      const sortMap: Record<string, string> = {
        title: 'title',
        difficulty: 'difficulty',
        acceptance: 'problemNumber', // Backend doesn't have acceptance_rate in list
        submissions: 'problemNumber', // Backend doesn't have total_submissions in list
      };
      
      params.sortBy = sortMap[sortBy] || 'problemNumber';
      params.order = sortBy === 'title' ? 'asc' : 'asc';
      
      const response = await problemsAPI.getProblems(params);
      
      // Transform backend problems to match frontend format
      const transformedProblems = response.results.map((p: any) => ({
        id: p._id || p.problemNumber.toString(),
        problemNumber: p.problemNumber,
        title: p.title,
        difficulty: p.difficulty?.toLowerCase() || 'medium',
        category: p.category || 'general',
        tags: p.tags || [],
        description: p.description || '',
        acceptance_rate: 0, // Backend doesn't provide this in list
        total_submissions: 0, // Backend doesn't provide this in list
      }));
      
      setProblems(transformedProblems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    // Most filtering is done on the backend, but we can do client-side filtering for status
    let filtered = [...problems];

    // Client-side status filter (if needed)
    // Note: Status filtering would require checking user submissions, which is complex
    // For now, we'll just show all problems

    setFilteredProblems(filtered);
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
          <h1 className="text-3xl font-bold text-white mb-2">Problems</h1>
          <p className="text-gray-400">Practice and master your coding skills</p>
        </div>

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
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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

        <div className="grid grid-cols-1 gap-4">
          {filteredProblems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg">No problems found matching your criteria</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
  <ProblemCard
    key={problem.id}
    problem={problem}
    onClick={() => {
      if (onNavigate) {
        onNavigate('problem', problem);
      } else {
        const id = problem.id || problem.problemNumber;
        navigate(`/problem/${id}`);
      }
    }}
  />
))
          )}
        </div>
      </div>
    </div>
  );
}
