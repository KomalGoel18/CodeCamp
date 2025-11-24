// backend/utils/timeUtils.js

/**
 * greetingForHour(hour) -> returns greeting string
 * hour: 0-23 (local hour)
 */
export const greetingForHour = (hour) => {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Late Night Coder";
};

/**
 * formatUTCDateKey(date) -> "YYYY-MM-DD" for a Date in UTC
 */
export const formatUTCDateKey = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
