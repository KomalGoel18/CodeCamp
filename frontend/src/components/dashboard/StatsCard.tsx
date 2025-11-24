import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'cyan' | 'green' | 'orange';
  trend?: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  cyan: 'from-cyan-500 to-cyan-600',
  green: 'from-green-500 to-green-600',
  orange: 'from-orange-500 to-orange-600',
};

const bgColorClasses = {
  blue: 'bg-blue-500/10',
  cyan: 'bg-cyan-500/10',
  green: 'bg-green-500/10',
  orange: 'bg-orange-500/10',
};

const textColorClasses = {
  blue: 'text-blue-400',
  cyan: 'text-cyan-400',
  green: 'text-green-400',
  orange: 'text-orange-400',
};

export default function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColorClasses[color]} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${textColorClasses[color]}`} />
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${textColorClasses[color]}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
