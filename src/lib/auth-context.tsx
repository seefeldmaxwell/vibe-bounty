"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, ApiError } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { username: string; email: string; password: string; role?: string }) => Promise<void>;
  loginWithGithub: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("vb_token");
    if (!token) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    try {
      const user = await api.auth.me();
      setState({ user, loading: false, error: null });
    } catch {
      localStorage.removeItem("vb_token");
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { user, token } = await api.auth.login(email, password);
      localStorage.setItem("vb_token", token);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  };

  const signup = async (data: { username: string; email: string; password: string; role?: string }) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { user, token } = await api.auth.signup(data);
      localStorage.setItem("vb_token", token);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Signup failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  };

  const loginWithGithub = async (code: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { user, token } = await api.auth.github(code);
      localStorage.setItem("vb_token", token);
      setState({ user, loading: false, error: null });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "GitHub login failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("vb_token");
    setState({ user: null, loading: false, error: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, loginWithGithub, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
