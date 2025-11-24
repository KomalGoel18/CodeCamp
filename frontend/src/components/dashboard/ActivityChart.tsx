// frontend/src/components/dashboard/ActivityChart.tsx
import React, { useMemo } from "react";

/**
 * props:
 *  - data: optional activity array from backend [{date, value?, submissions?, solved?}]
 *  - submissions: optional recent submissions list to derive activity if data missing
 */
export default function ActivityChart({
  data,
  submissions,
}: {
  data?: Array<{ date: string; value?: number; submissions?: number; solved?: number }>;
  submissions?: Array<any>;
}) {
  // Build a normalized array of points: { date: ISO, value: number }
  const points = useMemo(() => {
    if (data && data.length > 0) {
      // convert backend data to numeric value for chart (prefer value, else submissions, else solved)
      return data
        .map((d) => ({ date: new Date(d.date).toISOString(), value: Number(d.value ?? d.submissions ?? d.solved ?? 0) }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    if (submissions && submissions.length > 0) {
      // derive daily submission counts from submission timestamps
      const map = new Map<string, number>();
      submissions.forEach((s) => {
        const day = new Date(s.created_at || s.createdAt || s.createdAt).toISOString().slice(0, 10);
        map.set(day, (map.get(day) || 0) + 1);
      });
      const arr = Array.from(map.entries()).map(([date, value]) => ({ date: date + "T00:00:00.000Z", value }));
      return arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // fallback: empty
    return [];
  }, [data, submissions]);

  if (!points || points.length === 0) {
    return <div className="text-gray-400">No activity to show</div>;
  }

  // simple bar sparkline that respects dark theme
  const max = Math.max(...points.map((p) => p.value));
  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full space-x-2">
        {points.map((p, i) => {
          const h = max === 0 ? 4 : Math.max(6, (p.value / max) * 100);
          const label = new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
          return (
            <div key={i} className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex items-end justify-center">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {p.value}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-400 font-medium">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
