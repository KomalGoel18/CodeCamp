import { useMemo } from "react";

interface ActivityHeatmapProps {
  activity: Array<{ date: string; value: number }>;
  weeks?: number;
}

export default function ActivityHeatmap({ activity, weeks = 17 }: ActivityHeatmapProps) {
  const { cells, maxValue } = useMemo(() => {
    const map = new Map<string, number>();
    activity.forEach(({ date, value }) => {
      map.set(date, value);
    });

    const today = new Date();
    const cells: number[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (weeks - w) * 7 - (6 - d));
        const dateStr = date.toISOString().slice(0, 10);
        col.push(map.get(dateStr) ?? 0);
      }
      cells.push(col);
    }
    const flat = cells.flat();
    const maxValue = Math.max(1, ...flat);
    return { cells, maxValue };
  }, [activity, weeks]);

  const getIntensity = (value: number) => {
    if (value === 0) return "bg-gray-800/60";
    const ratio = value / maxValue;
    if (ratio <= 0.25) return "bg-emerald-500/30";
    if (ratio <= 0.5) return "bg-emerald-500/50";
    if (ratio <= 0.75) return "bg-emerald-500/70";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          {["bg-gray-800/60", "bg-emerald-500/30", "bg-emerald-500/50", "bg-emerald-500/70", "bg-emerald-500"].map(
            (c) => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            )
          )}
        </div>
        <span>More</span>
      </div>
      <div className="flex gap-1">
        {cells.map((col, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {col.map((val, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm transition-colors ${getIntensity(val)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
