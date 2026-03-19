interface DonutChartProps {
  value: number;
  total: number;
  label: string;
  size?: number;
}

export default function DonutChart({
  value,
  total,
  label,
  size = 120,
}: DonutChartProps) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const strokeWidth = size * 0.12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-emerald-500 transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{percent}%</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </div>
  );
}
