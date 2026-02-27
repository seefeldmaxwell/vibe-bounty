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
    throw new ApiError(res.status, (body as { error?: string }).error || "Request failed");
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Auth
export const api = {
  auth: {
    github: (code: string) =>
      request<{ user: any; token: string }>("/api/auth/github", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    signup: (data: { username: string; email: string; password: string; role?: string }) =>
      request<{ user: any; token: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<any>("/api/auth/me"),
  },

  bounties: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/api/bounties${qs}`);
    },
    get: (id: string) => request<any>(`/api/bounties/${id}`),
    create: (data: any) =>
      request<any>("/api/bounties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/api/bounties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/api/bounties/${id}`, { method: "DELETE" }),
    award: (id: string, submissionId: string) =>
      request<any>(`/api/bounties/${id}/award`, {
        method: "POST",
        body: JSON.stringify({ submission_id: submissionId }),
      }),
  },

  submissions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/api/submissions${qs}`);
    },
    get: (id: string) => request<any>(`/api/submissions/${id}`),
    create: (data: any) =>
      request<any>("/api/submissions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/api/submissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    score: (id: string, score: number, feedback: string) =>
      request<any>(`/api/submissions/${id}/score`, {
        method: "POST",
        body: JSON.stringify({ score, feedback }),
      }),
  },

  comments: {
    list: (bountyId: string) => request<any[]>(`/api/comments/${bountyId}`),
    create: (data: { bounty_id: string; content: string; submission_id?: string }) =>
      request<any>("/api/comments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<any>(`/api/comments/${id}`, { method: "DELETE" }),
  },

  users: {
    get: (username: string) => request<any>(`/api/users/${username}`),
    updateMe: (data: any) =>
      request<any>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  stats: () => request<any>("/api/stats"),

  leaderboard: (type: "builders" | "posters") =>
    request<any[]>(`/api/leaderboard?type=${type}`),

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

    return res.json();
  },
};
