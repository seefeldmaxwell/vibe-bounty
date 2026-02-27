"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, User, Zap,
  Megaphone, Code2, Layers, ArrowRight, ArrowLeft, Check, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const MS_CLIENT_ID = process.env.NEXT_PUBLIC_MS_CLIENT_ID || "";

type Role = "poster" | "builder" | "both";

const roles: { id: Role; label: string; description: string; icon: React.ReactNode }[] = [
  { id: "poster", label: "Poster", description: "Post bounties and find talented builders for your projects", icon: <Megaphone className="w-6 h-6" /> },
  { id: "builder", label: "Builder", description: "Discover bounties and earn money building cool stuff", icon: <Code2 className="w-6 h-6" /> },
  { id: "both", label: "Both", description: "Post bounties and build for others — the full experience", icon: <Layers className="w-6 h-6" /> },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast("Please fill in all fields", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast("Passwords don't match", "error");
      return;
    }
    if (form.password.length < 8) {
      toast("Password must be at least 8 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await signup({ username: form.username, email: form.email, password: form.password, role: selectedRole || "builder" });
      toast("Account created! Welcome to VibeBounty.", "success");
      router.push("/dashboard");
    } catch (err: any) {
      toast(err.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast("Google OAuth not configured yet", "error");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: "google",
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const handleMicrosoft = () => {
    if (!MS_CLIENT_ID) {
      toast("Microsoft OAuth not configured yet", "error");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const params = new URLSearchParams({
      client_id: MS_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email User.Read",
      state: "microsoft",
      response_mode: "query",
    });
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-neon/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <span className="text-2xl font-bold font-mono gradient-text">VibeBounty</span>
          </Link>
          <p className="text-muted-foreground mt-3 text-sm">Create your account</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono transition-colors", step === 1 ? "bg-accent/20 text-accent border border-accent/30" : "bg-surface text-muted-foreground border border-border")}>
            {step > 1 ? <Check className="w-3 h-3" /> : <span>1</span>}
            <span>Role</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono transition-colors", step === 2 ? "bg-accent/20 text-accent border border-accent/30" : "bg-surface text-muted-foreground border border-border")}>
            <span>2</span>
            <span>Credentials</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 border border-border animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-mono text-foreground mb-1">Choose your role</h2>
                <p className="text-sm text-muted-foreground">How do you want to use VibeBounty?</p>
              </div>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left group",
                      selectedRole === role.id ? "border-accent/50 bg-accent/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]" : "border-border bg-card hover:border-border-bright hover:bg-card-hover"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors", selectedRole === role.id ? "bg-accent/20 text-accent" : "bg-surface text-muted-foreground group-hover:text-foreground")}>
                      {role.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold font-mono text-foreground">{role.label}</span>
                        {selectedRole === role.id && <Check className="w-4 h-4 text-accent" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className={cn("w-full py-3.5 font-semibold rounded-xl transition-all duration-200 font-mono flex items-center justify-center gap-2", selectedRole ? "bg-accent hover:bg-accent-hover text-white hover:scale-[1.02] active:scale-[0.98] glow-accent" : "bg-muted text-muted-foreground cursor-not-allowed")}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(1)} className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold font-mono text-foreground">Create your account</h2>
                  <p className="text-sm text-muted-foreground">
                    Signing up as <span className="text-accent font-mono capitalize">{selectedRole}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </button>

                <button
                  onClick={handleMicrosoft}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#2F2F2F] text-white font-semibold rounded-xl hover:bg-[#404040] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  Sign up with Microsoft
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-mono tracking-wider">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-foreground/80 font-mono">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="username" type="text" value={form.username} onChange={(e) => updateField("username", e.target.value)} placeholder="hackerman" className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 font-mono">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="hacker@vibebounty.dev" className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground/80 font-mono">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateField("password", e.target.value)} placeholder="••••••••••" className="w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 font-mono">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} placeholder="••••••••••" className="w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-accent font-mono mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
