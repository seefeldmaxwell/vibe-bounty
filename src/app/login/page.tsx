"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Github, Mail, Lock, Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      toast(err.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHub = () => {
    if (!GITHUB_CLIENT_ID) {
      toast("GitHub OAuth not configured yet", "error");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-all group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Zap className="w-5 h-5 text-accent transition-transform group-hover:scale-110" />
            </div>
            <span className="text-2xl font-bold font-mono gradient-text">VibeBounty</span>
          </Link>
          <p className="text-muted-foreground mt-3 text-sm">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-border animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <button
            onClick={handleGitHub}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-mono tracking-wider">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 font-mono">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hacker@vibebounty.dev"
                  className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 font-mono">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-accent font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
