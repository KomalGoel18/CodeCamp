// frontend/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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

  getProblem: async (number: number) => {
    return apiRequest<any>(`/problems/${number}`);
  },
};

// Submissions API
export const submissionsAPI = {
  submitSolution: async (problemId: string, code: string, language: string) => {
    return apiRequest<{ message: string; submission: any }>("/submissions", {
      method: "POST",
      body: JSON.stringify({ problemId, code, language }),
    });
  },

  getSubmissionsByUser: async () => {
    return apiRequest<any[]>("/submissions/user");
  },

  getSubmissionResult: async (id: string) => {
    return apiRequest<any>(`/submissions/${id}`);
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

  rank?: number;
  points?: number;

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
  rank: number;
  points: number;
  activity: Array<{ date: string; value: number }>;
};

export const dashboardAPI = {
  getDashboardData: async (opts?: { range?: string }): Promise<DashboardData> => {
    const qs = opts?.range ? `?range=${encodeURIComponent(opts.range)}` : "";
    const raw = await apiRequest<RawDashboard>(`/dashboard${qs}`);

    // normalize activity to simple { date, value } points
    const activity: DashboardData["activity"] = (raw.activity ?? []).map((d) => ({
      date: d.date,
      value: Number(d.value ?? d.submissions ?? d.solved ?? 0),
    }));

    return {
      username: raw.username,
      welcomeMessage: raw.welcomeMessage,
      totalSolved: raw.totalSolved ?? raw.total_solved ?? 0,
      totalSubmissions: raw.totalSubmissions ?? raw.total_submissions ?? 0,
      acceptanceRate: raw.acceptanceRate ?? raw.acceptance_rate ?? 0,
      currentStreak: raw.currentStreak ?? raw.current_streak ?? 0,
      rank: raw.rank ?? 0,
      points: raw.points ?? 0,
      activity,
    };
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: async () => {
    // Accept both camelCase and snake_case from backend
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
