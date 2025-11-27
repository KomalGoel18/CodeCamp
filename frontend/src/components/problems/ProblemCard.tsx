// src/components/problems/ProblemCard.tsx
import { Link } from 'react-router-dom';

interface ProblemCardProps {
  problem: any;
  onClick?: () => void; // made optional
}

const difficultyColors = {
  easy: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-400',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-400',
  },
  hard: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
  },
};

export default function ProblemCard({ problem, onClick }: ProblemCardProps) {
  const diffColor = difficultyColors[(problem.difficulty || 'medium') as keyof typeof difficultyColors];
  const id = problem.id || problem._id || problem.problemNumber;

  // wrapper props: call onClick if provided
    const handleClick = () => {
    if (onClick) {
      try { onClick(); } catch (_err) { /* ignore */ }
    }
    // Link will navigate automatically
  };

  return (
    <Link to={`/problem/${id}`} onClick={handleClick} className="no-underline">
      <div
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:bg-gray-800/50 transition-all cursor-pointer group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {problem.title}
              </h3>
              <div className={`px-3 py-1 rounded-full border ${diffColor.bg} ${diffColor.border}`}>
                <span className={`text-xs font-semibold ${diffColor.text}`}>
                  {String(problem.difficulty || 'medium').toUpperCase()}
                </span>
              </div>
            </div>

            {problem.description && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {problem.description.length > 150 ? `${problem.description.slice(0, 150)}...` : problem.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {problem.category && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                  {problem.category}
                </span>
              )}
              {problem.tags && problem.tags.length > 0 && (
                <>
                  {problem.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full border border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {problem.tags.length > 3 && (
                    <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full border border-gray-700">
                      +{problem.tags.length - 3} more
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right-side stats removed for a cleaner UI */}
        </div>
      </div>
    </Link>
  );
}
