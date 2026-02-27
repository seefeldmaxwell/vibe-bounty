"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  CreditCard,
  Bell,
  AlertTriangle,
  Save,
  Github,
  Globe,
  Mail,
  AtSign,
  Trash2,
  Camera,
  Shield,
  Wallet,
  BellRing,
  BellOff,
  CheckCircle2,
  Hammer,
  Megaphone,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";

type Role = "poster" | "builder" | "both";

export default function SettingsPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState<Role>("builder");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
    if (currentUser) {
      setDisplayName(currentUser.display_name || "");
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      setBio(currentUser.bio || "");
      setGithubUrl(currentUser.github_url || "");
      setPortfolioUrl(currentUser.portfolio_url || "");
      setAvatarUrl(currentUser.avatar_url || "");
      setRole((currentUser.role as Role) || "builder");
    }
  }, [currentUser, authLoading, router]);

  const [notifBountyUpdates, setNotifBountyUpdates] = useState(true);
  const [notifSubmissionReviews, setNotifSubmissionReviews] = useState(true);
  const [notifNewComments, setNotifNewComments] = useState(true);
  const [notifNewBounties, setNotifNewBounties] = useState(false);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(true);
  const [notifMarketingEmails, setNotifMarketingEmails] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.users.updateMe({
        display_name: displayName,
        bio,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        role,
      });
      await refreshUser();
      setSaved(true);
      toast("Settings saved!", "success");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-2">
            <Settings className="inline h-8 w-8 mr-3 text-accent" />
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile, preferences, and account
          </p>
        </div>

        <div className="space-y-8">
          {/* ===================== PROFILE SECTION ===================== */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <User className="h-5 w-5 text-accent" />
              <h2 className="font-mono text-lg font-bold">Profile</h2>
            </div>

            <div className="glass rounded-xl p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-xl ring-2 ring-accent/20 bg-card"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Display Name & Username */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    <AtSign className="h-3 w-3 inline mr-1" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  <Mail className="h-3 w-3 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world who you are..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {bio.length}/160 characters
                </p>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  <Github className="h-3 w-3 inline mr-1" />
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors font-mono"
                />
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yoursite.dev"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors font-mono"
                />
              </div>
            </div>
          </section>

          {/* ===================== ROLE SECTION ===================== */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Shield className="h-5 w-5 text-accent" />
              <h2 className="font-mono text-lg font-bold">Role</h2>
            </div>

            <div className="glass rounded-xl p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to use VibeBounty
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setRole("builder")}
                  className={cn(
                    "rounded-xl border-2 p-5 text-left transition-all",
                    role === "builder"
                      ? "border-neon bg-neon/5"
                      : "border-border hover:border-border-bright bg-white/[0.01]"
                  )}
                >
                  <Hammer
                    className={cn(
                      "h-6 w-6 mb-3",
                      role === "builder" ? "text-neon" : "text-muted-foreground"
                    )}
                  />
                  <h3
                    className={cn(
                      "font-mono text-sm font-bold mb-1",
                      role === "builder" ? "text-neon" : "text-foreground"
                    )}
                  >
                    Builder
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Submit solutions to bounties and earn money
                  </p>
                </button>

                <button
                  onClick={() => setRole("poster")}
                  className={cn(
                    "rounded-xl border-2 p-5 text-left transition-all",
                    role === "poster"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-border-bright bg-white/[0.01]"
                  )}
                >
                  <Megaphone
                    className={cn(
                      "h-6 w-6 mb-3",
                      role === "poster"
                        ? "text-accent"
                        : "text-muted-foreground"
                    )}
                  />
                  <h3
                    className={cn(
                      "font-mono text-sm font-bold mb-1",
                      role === "poster" ? "text-accent" : "text-foreground"
                    )}
                  >
                    Poster
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Post bounties and find builders for your projects
                  </p>
                </button>

                <button
                  onClick={() => setRole("both")}
                  className={cn(
                    "rounded-xl border-2 p-5 text-left transition-all",
                    role === "both"
                      ? "border-yellow-400 bg-yellow-400/5"
                      : "border-border hover:border-border-bright bg-white/[0.01]"
                  )}
                >
                  <Sparkles
                    className={cn(
                      "h-6 w-6 mb-3",
                      role === "both"
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                  <h3
                    className={cn(
                      "font-mono text-sm font-bold mb-1",
                      role === "both" ? "text-yellow-400" : "text-foreground"
                    )}
                  >
                    Both
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Build and post bounties on the platform
                  </p>
                </button>
              </div>
            </div>
          </section>

          {/* ===================== PAYOUT SECTION ===================== */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Wallet className="h-5 w-5 text-neon" />
              <h2 className="font-mono text-lg font-bold">
                Payout Information
              </h2>
            </div>

            <div className="glass rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neon/5 border border-neon/20">
                <CreditCard className="h-5 w-5 text-neon flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Payout information is securely stored and encrypted. We
                  support direct bank transfer and Stripe payouts.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Payout Method
                  </label>
                  <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 appearance-none cursor-pointer">
                    <option>Stripe Connect</option>
                    <option>Bank Transfer (ACH)</option>
                    <option>PayPal</option>
                    <option>Crypto (USDC)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Payout Email
                  </label>
                  <input
                    type="email"
                    placeholder="payout@example.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="Full legal name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Country
                  </label>
                  <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 appearance-none cursor-pointer">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Germany</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Tax ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="SSN, EIN, or VAT number"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===================== NOTIFICATIONS SECTION ===================== */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Bell className="h-5 w-5 text-accent" />
              <h2 className="font-mono text-lg font-bold">
                Notification Preferences
              </h2>
            </div>

            <div className="glass rounded-xl p-6 space-y-1">
              <NotificationToggle
                label="Bounty updates"
                description="When bounties you posted or submitted to are updated"
                icon={<BellRing className="h-4 w-4" />}
                enabled={notifBountyUpdates}
                onChange={setNotifBountyUpdates}
              />
              <NotificationToggle
                label="Submission reviews"
                description="When your submissions are reviewed or scored"
                icon={<Star className="h-4 w-4" />}
                enabled={notifSubmissionReviews}
                onChange={setNotifSubmissionReviews}
              />
              <NotificationToggle
                label="New comments"
                description="When someone comments on your bounty or submission"
                icon={<Mail className="h-4 w-4" />}
                enabled={notifNewComments}
                onChange={setNotifNewComments}
              />
              <NotificationToggle
                label="New bounties"
                description="Get notified when bounties matching your skills are posted"
                icon={<Sparkles className="h-4 w-4" />}
                enabled={notifNewBounties}
                onChange={setNotifNewBounties}
              />
              <NotificationToggle
                label="Weekly digest"
                description="A weekly summary of platform activity and your stats"
                icon={<Bell className="h-4 w-4" />}
                enabled={notifWeeklyDigest}
                onChange={setNotifWeeklyDigest}
              />
              <NotificationToggle
                label="Marketing emails"
                description="Product updates, feature announcements, and promotions"
                icon={<BellOff className="h-4 w-4" />}
                enabled={notifMarketingEmails}
                onChange={setNotifMarketingEmails}
              />
            </div>
          </section>

          {/* ===================== SAVE BUTTON ===================== */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-neon font-mono animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* ===================== DANGER ZONE ===================== */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <h2 className="font-mono text-lg font-bold text-danger">
                Danger Zone
              </h2>
            </div>

            <div className="rounded-xl border-2 border-danger/20 bg-danger/5 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-mono text-sm font-bold text-danger mb-1">
                    Delete Account
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Permanently delete your account and all associated data.
                    This action cannot be undone. All bounties, submissions, and
                    earnings records will be removed.
                  </p>
                </div>
                <button className="flex items-center justify-center gap-2 rounded-lg border-2 border-danger/50 px-6 py-2.5 text-sm font-mono font-semibold text-danger hover:bg-danger hover:text-white hover:border-danger transition-all flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ===================== NOTIFICATION TOGGLE ===================== */

function NotificationToggle({
  label,
  description,
  icon,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span
          className={cn(
            "mt-0.5 flex-shrink-0",
            enabled ? "text-accent" : "text-muted-foreground"
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-medium">{label}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
          enabled ? "bg-accent" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
