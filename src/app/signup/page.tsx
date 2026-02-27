"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Github,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Zap,
  Megaphone,
  Code2,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "poster" | "builder" | "both";

const roles: { id: Role; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "poster",
    label: "Poster",
    description: "Post bounties and find talented builders for your projects",
    icon: <Megaphone className="w-6 h-6" />,
  },
  {
    id: "builder",
    label: "Builder",
    description: "Discover bounties and earn money building cool stuff",
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    id: "both",
    label: "Both",
    description: "Post bounties and build for others — the full experience",
    icon: <Layers className="w-6 h-6" />,
  },
];

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-neon/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <span className="text-2xl font-bold font-mono gradient-text">
              VibeBounty
            </span>
          </Link>
          <p className="text-muted-foreground mt-3 text-sm">
            Create your account
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono transition-colors",
              step === 1
                ? "bg-accent/20 text-accent border border-accent/30"
                : "bg-surface text-muted-foreground border border-border"
            )}
          >
            {step > 1 ? <Check className="w-3 h-3" /> : <span>1</span>}
            <span>Role</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono transition-colors",
              step === 2
                ? "bg-accent/20 text-accent border border-accent/30"
                : "bg-surface text-muted-foreground border border-border"
            )}
          >
            <span>2</span>
            <span>Credentials</span>
          </div>
        </div>

        {/* Signup Card */}
        <div className="glass rounded-2xl p-8 border border-border">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold font-mono text-foreground mb-1">
                  Choose your role
                </h2>
                <p className="text-sm text-muted-foreground">
                  How do you want to use VibeBounty?
                </p>
              </div>

              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left group",
                      selectedRole === role.id
                        ? "border-accent/50 bg-accent/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                        : "border-border bg-card hover:border-border-bright hover:bg-card-hover"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        selectedRole === role.id
                          ? "bg-accent/20 text-accent"
                          : "bg-surface text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {role.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold font-mono text-foreground">
                          {role.label}
                        </span>
                        {selectedRole === role.id && (
                          <Check className="w-4 h-4 text-accent" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className={cn(
                  "w-full py-3.5 font-semibold rounded-xl transition-all duration-200 font-mono flex items-center justify-center gap-2",
                  selectedRole
                    ? "bg-accent hover:bg-accent-hover text-white hover:scale-[1.02] active:scale-[0.98] glow-accent"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold font-mono text-foreground">
                    Create your account
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Signing up as{" "}
                    <span className="text-accent font-mono capitalize">
                      {selectedRole}
                    </span>
                  </p>
                </div>
              </div>

              {/* GitHub OAuth */}
              <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Github className="w-5 h-5" />
                Sign up with GitHub
              </button>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-mono tracking-wider">
                    or
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-4"
              >
                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-foreground/80 font-mono"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="username"
                      type="text"
                      value={form.username}
                      onChange={(e) => updateField("username", e.target.value)}
                      placeholder="hackerman"
                      className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground/80 font-mono"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="hacker@vibebounty.dev"
                      className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground/80 font-mono"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="••••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-foreground/80 font-mono"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      placeholder="••••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-accent font-mono mt-2"
                >
                  Create Account
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
