// frontend/src/lib/api.ts
// Supports both Vite-style and Next.js-style env naming (without forcing a framework change).
// If no env var is set and we're running on localhost, default to local backend for dev.
const rawBaseUrl = (() => {
  const viteBase = (import.meta as any)?.env?.VITE_API_BASE_URL;
  const nextBase = (import.meta as any)?.env?.NEXT_PUBLIC_API_URL;
  if (viteBase) return viteBase;
  if (nextBase) return nextBase;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }
  return "https://solveon-backend.onrender.com/api";
})();

export const API_BASE_URL = String(rawBaseUrl).replace(/\/$/, ""); // Remove trailing slash if present


// Helper function to get auth token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Helper function to set auth token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

// Helper function to remove auth token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem("token");
};

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  // Use Record<string,string> so we can safely assign Authorization
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;


  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Some endpoints might return empty body (204). Guard that.
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    return apiRequest<{ token: string; user: { id: string; username: string; email: string } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      }
    );
  },

  login: async (email: string, password: string) => {
    return apiRequest<{ token: string; user: { id: string; username: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest<{ token: string; message: string }>(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },
};

// Problems API
export const problemsAPI = {
  getProblems: async (params?: {
    difficulty?: string;
    category?: string;
    tags?: string;
    sortBy?: string;
    order?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return apiRequest<{ results: any[]; total: number; page: number; limit: number }>(
      `/problems${queryString ? `?${queryString}` : ""}`
    );
  },

  getProblem: async (idOrNumber: number | string) => {
    return apiRequest<any>(`/problems/${idOrNumber}`);
  },
};

// Submissions API
export const submissionsAPI = {
  submitSolution: async (problemIdentifier: string | number, code: string, language: string) => {
    const payload: any = { code, language };
    const s = String(problemIdentifier);
    if (/^[0-9a-fA-F]{24}$/.test(s)) payload.problemId = s;
    else if (!Number.isNaN(Number(s))) payload.problemNumber = Number(s);
    else payload.problemId = s; // fallback
    return apiRequest<{ message: string; submission: any }>("/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getSubmissionsByUser: async () => {
    return apiRequest<any[]>("/submissions/user");
  },

  getSubmissionResult: async (id: string) => {
    return apiRequest<any>(`/submissions/${id}`);
  },
};

// Users API
export type MyProfile = {
  username?: string;
  email?: string;
  totalSolved?: number;
  totalSubmissions?: number;
  solvedByDifficulty?: { easy?: number; medium?: number; hard?: number };
  lastSolvedAt?: string | null;
  streak?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const usersAPI = {
  getMyProfile: async (): Promise<MyProfile> => {
    return apiRequest<MyProfile>("/users/me");
  },

  updateMyProfile: async (payload: {
    username?: string;
    email?: string;
  }) => {
    return apiRequest<MyProfile>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  getPublicProfile: async (username: string) => {
    return apiRequest<{
      username: string;
      totalSolved: number;
      totalSubmissions: number;
      streak: number;
      createdAt: string;
    }>(`/users/public/${username}`);
  },
};

// Tests API – run code against sample tests for a problem
export const testsAPI = {
  // frontend/src/lib/api.ts (testsAPI)
  runTests: async (problemIdentifier: string | number, code: string, language: string) => {
    const payload: any = { code, language };
    const s = String(problemIdentifier);
    if (/^[0-9a-fA-F]{24}$/.test(s)) payload.problemId = s;
    else if (!Number.isNaN(Number(s))) payload.problemNumber = Number(s);
    else payload.problemId = s;
    return apiRequest<{ passed: number; total: number; results: any[] }>("/tests/run", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// Dashboard API
type RawDashboard = {
  username?: string;
  welcomeMessage?: string;
  totalSolved?: number;
  total_solved?: number;
  totalSubmissions?: number;
  total_submissions?: number;
  acceptanceRate?: number;
  acceptance_rate?: number;
  currentStreak?: number;
  current_streak?: number;
  personalBestStreak?: number;
  rank?: number;
  percentile?: number;
  points?: number;
  difficultySummary?: { easy?: number; medium?: number; hard?: number };
  problemTotals?: { easy?: number; medium?: number; hard?: number; total?: number };
  activity?: Array<{
    date: string;
    value?: number;
    submissions?: number;
    solved?: number;
  }>;
};

export type DashboardData = {
  username?: string;
  welcomeMessage?: string;
  totalSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
  currentStreak: number;
  personalBestStreak: number;
  rank: number;
  percentile: number;
  points: number;
  difficultySummary: { easy: number; medium: number; hard: number };
  problemTotals: { easy: number; medium: number; hard: number; total: number };
  activity: Array<{ date: string; value: number }>;
};

export const dashboardAPI = {
  getDashboardData: async (opts?: { range?: string }): Promise<DashboardData> => {
    const qs = opts?.range ? `?range=${encodeURIComponent(opts.range)}` : "";
    const raw = await apiRequest<RawDashboard>(`/dashboard${qs}`);

    const activity: DashboardData["activity"] = (raw.activity ?? []).map((d) => ({
      date: d.date,
      value: Number(d.value ?? d.submissions ?? d.solved ?? 0),
    }));

    const totalSolved = raw.totalSolved ?? raw.total_solved ?? 0;
    const totalSubmissions = raw.totalSubmissions ?? raw.total_submissions ?? 0;

    const diff = raw.difficultySummary ?? {};
    const difficultySummary = {
      easy: diff.easy ?? 0,
      medium: diff.medium ?? 0,
      hard: diff.hard ?? 0,
    };

    const pt = raw.problemTotals ?? {};
    const problemTotals = {
      easy: pt.easy ?? 0,
      medium: pt.medium ?? 0,
      hard: pt.hard ?? 0,
      total: pt.total ?? 0,
    };

    return {
      username: raw.username,
      welcomeMessage: raw.welcomeMessage,
      totalSolved,
      totalSubmissions,
      acceptanceRate: raw.acceptanceRate ?? 0,
      currentStreak: raw.currentStreak ?? raw.current_streak ?? 0,
      personalBestStreak: raw.personalBestStreak ?? 0,
      rank: raw.rank ?? 0,
      percentile: raw.percentile ?? 0,
      points: raw.points ?? 0,
      difficultySummary,
      problemTotals,
      activity,
    };
  },
};

// Leaderboard API
export type LeaderboardStats = {
  totalParticipants?: number;
  averageSolved?: number;
  topSubmissions?: number;
};

export const leaderboardAPI = {
  getLeaderboard: async () => {
    return apiRequest<Array<{
      username?: string;
      email?: string;
      rank?: number;
      totalSolved?: number;
      total_solved?: number;
      solvedByDifficulty?: {
        easy?: number;
        medium?: number;
        hard?: number;
      };
      solved_by_difficulty?: {
        easy?: number;
        medium?: number;
        hard?: number;
      };
      easySolved?: number;
      mediumSolved?: number;
      hardSolved?: number;
      user?: { username?: string; email?: string };
    }>>("/leaderboard");
  },
  getLeaderboardStats: async (): Promise<LeaderboardStats> => {
    try {
      return await apiRequest<LeaderboardStats>("/leaderboard/stats");
    } catch {
      return {};
    }
  },
};

// Code Execution API
export const codeExecutionAPI = {
  executeCode: async (language_id: number, source_code: string, stdin: string) => {
    return apiRequest<any>("/code/execute", {
      method: "POST",
      body: JSON.stringify({ language_id, source_code, stdin }),
    });
  },
};
