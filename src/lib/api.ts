import type { User, Bounty, Submission, Comment, PlatformStats } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vibe-bounty-api.seefeldmaxwell1.workers.dev";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vb_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    const error = new ApiError(res.status, (body as { error?: string }).error || "Request failed");
    // Auto-clear expired token
    if (res.status === 401 && token && typeof window !== "undefined") {
      localStorage.removeItem("vb_token");
    }
    throw error;
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface AuthResponse {
  user: User;
  token: string;
}

// Auth
export const api = {
  auth: {
    google: (code: string, redirect_uri: string) =>
      request<AuthResponse>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ code, redirect_uri }),
      }),
    microsoft: (code: string, redirect_uri: string) =>
      request<AuthResponse>("/api/auth/microsoft", {
        method: "POST",
        body: JSON.stringify({ code, redirect_uri }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    signup: (data: { username: string; email: string; password: string; role?: string }) =>
      request<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<User>("/api/auth/me"),
  },

  bounties: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<Bounty[]>(`/api/bounties${qs}`);
    },
    get: (id: string) => request<Bounty>(`/api/bounties/${id}`),
    create: (data: Partial<Bounty>) =>
      request<Bounty>("/api/bounties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Bounty>) =>
      request<Bounty>(`/api/bounties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/bounties/${id}`, { method: "DELETE" }),
    award: (id: string, submissionId: string) =>
      request<Bounty>(`/api/bounties/${id}/award`, {
        method: "POST",
        body: JSON.stringify({ submission_id: submissionId }),
      }),
  },

  submissions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<Submission[]>(`/api/submissions${qs}`);
    },
    get: (id: string) => request<Submission>(`/api/submissions/${id}`),
    create: (data: Partial<Submission>) =>
      request<Submission>("/api/submissions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Submission>) =>
      request<Submission>(`/api/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    score: (id: string, score: number, feedback: string) =>
      request<Submission>(`/api/submissions/${id}/score`, {
        method: "POST",
        body: JSON.stringify({ score, feedback }),
      }),
  },

  comments: {
    list: (bountyId: string) => request<Comment[]>(`/api/comments/${bountyId}`),
    create: (data: { bounty_id: string; content: string; submission_id?: string }) =>
      request<Comment>("/api/comments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/comments/${id}`, { method: "DELETE" }),
  },

  users: {
    get: (username: string) => request<User>(`/api/users/${username}`),
    updateMe: (data: Partial<User>) =>
      request<User>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  stats: () => request<PlatformStats>("/api/stats"),

  leaderboard: (type: "builders" | "posters") =>
    request<User[]>(`/api/leaderboard?type=${type}`),

  upload: async (submissionId: string, files: File[]) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("submission_id", submissionId);
    files.forEach((f) => formData.append("files", f));

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new ApiError(res.status, (body as { error?: string }).error || "Upload failed");
    }

    return res.json() as Promise<{ urls: string[] }>;
  },
};
