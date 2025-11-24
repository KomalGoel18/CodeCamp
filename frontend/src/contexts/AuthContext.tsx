// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type User = {
  _id?: string;
  username?: string;
  email?: string;
  // add any other fields your backend returns
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetUrl?: string; resetToken?: string }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

  // helper to read backend error shapes
  const parseError = async (res: Response) => {
    let text = res.statusText || "Request failed";
    try {
      const body = await res.json();
      // your backend returns { message: '...' } for errors
      if (body?.message) text = body.message;
      else if (body?.error) text = body.error;
      else text = JSON.stringify(body);
    } catch {
      // ignore JSON parse error; keep statusText
    }
    return text;
  };

  // Try to load user from token on mount
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // if /auth/me is not available or token invalid, clear token and bail
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        // controller returns { user }
        setUser(data.user ?? data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Sign in (login)
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errMsg = await parseError(res);
        // map common statuses based on your controller behavior
        if (res.status === 400) throw new Error(errMsg || "Email and password are required");
        if (res.status === 401) throw new Error(errMsg || "Invalid credentials");
        if (res.status === 404) throw new Error(errMsg || "User not found");
        throw new Error(errMsg || "Login failed");
      }

      const data = await res.json();
      const token = data.token ?? data?.user?.token;
      if (!token) throw new Error("No token returned from server");
      localStorage.setItem("token", token);

      // server returns { token, user: { ... } } — set user if present
      if (data.user) {
        setUser(data.user);
      } else {
        // fallback: call /auth/me to populate user
        const me = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (me.ok) {
          const meData = await me.json();
          setUser(meData.user ?? meData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign up (register)
  const signUp = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const errMsg = await parseError(res);
        if (res.status === 400) throw new Error(errMsg || "username, email and password required");
        if (res.status === 409) throw new Error(errMsg || "Email already registered");
        throw new Error(errMsg || "Registration failed");
      }

      const data = await res.json();
      const token = data.token ?? data?.user?.token;
      if (token) {
        localStorage.setItem("token", token);
        // controller returns user on register; set it if present
        if (data.user) setUser(data.user);
        else {
          // try to fetch /auth/me
          const me = await fetch(`${apiBase}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (me.ok) {
            const meData = await me.json();
            setUser(meData.user ?? meData);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password (request reset)
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errMsg = await parseError(res);
        if (res.status === 400) throw new Error(errMsg || "Email required");
        if (res.status === 404) throw new Error(errMsg || "No user with that email");
        throw new Error(errMsg || "Failed to send reset email");
      }

      const data = await res.json();
      // your controller returns either { message: "...", resetToken, resetUrl } in dev
      return {
        message: data.message ?? "If your email exists, a reset link has been sent",
        resetUrl: data.resetUrl,
        resetToken: data.resetToken,
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    forgotPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// strict hook: throws if used outside provider (keeps types safe)
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
