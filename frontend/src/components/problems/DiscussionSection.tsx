import { MessageSquare } from 'lucide-react';

interface DiscussionSectionProps {
  problemId: string;
}

export default function DiscussionSection({ problemId }: DiscussionSectionProps) {
  // Discussion feature is not yet implemented in the backend
  // This is a placeholder component

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Discussion</h3>
      </div>

      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Discussion feature coming soon!</p>
        <p className="text-gray-500 text-sm mt-2">This feature will be available once the backend API is implemented.</p>
      </div>
    </div>
  );
}
