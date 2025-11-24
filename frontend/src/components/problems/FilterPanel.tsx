import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    difficulty: string;
    category: string;
    status: string;
    tags: string[];
  };
  setFilters: (filters: any) => void;
  allProblems: any[];
}

export default function FilterPanel({ filters, setFilters, allProblems }: FilterPanelProps) {
  const categories = Array.from(new Set(allProblems.map((p) => p.category)));
  const allTags = Array.from(new Set(allProblems.flatMap((p) => p.tags)));

  const toggleTag = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag],
    });
  };

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      category: 'all',
      status: 'all',
      tags: [],
    });
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-800 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Filter Options</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
          <div className="space-y-2">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <label key={diff} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="difficulty"
                  value={diff}
                  checked={filters.difficulty === diff}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-2 bg-gray-800 border-gray-700"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors capitalize">
                  {diff}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
          <div className="space-y-2">
            {['all', 'solved', 'attempted', 'todo'].map((status) => (
              <label key={status} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={filters.status === status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-2 bg-gray-800 border-gray-700"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors capitalize">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-400 mb-3">Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filters.tags.includes(tag)
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white'
              }`}
            >
              {tag}
              {filters.tags.includes(tag) && <X className="inline-block w-3 h-3 ml-1" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
