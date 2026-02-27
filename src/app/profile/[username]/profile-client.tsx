"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star, DollarSign, Calendar, Github, Globe, ArrowLeft, ArrowUpRight,
  ExternalLink, Send, FileText, Clock, Trophy, Shield, Loader2,
} from "lucide-react";
import { cn, formatCurrency, formatDate, timeAgo, timeRemaining } from "@/lib/utils";
import { StatusBadge, SubmissionStatusBadge, CategoryBadge } from "@/components/badges";
import { api } from "@/lib/api";

type ProfileTab = "bounties" | "submissions";

function parseTags(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

export default function ProfileClient({ username }: { username: string }) {
  const [user, setUser] = useState<any>(null);
  const [bounties, setBounties] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("bounties");

  useEffect(() => {
    setLoading(true);
    api.users.get(username)
      .then((u) => {
        setUser(u);
        return Promise.all([
          api.bounties.list({ poster_id: u.id }).catch(() => []),
          api.submissions.list({ builder_id: u.id }).catch(() => []),
        ]);
      })
      .then(([b, s]) => {
        setBounties(b || []);
        setSubmissions(s || []);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-32 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <Shield className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-mono text-2xl font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground text-sm mb-4">No user with the handle @{username}</p>
        <Link href="/leaderboard" className="text-accent hover:underline text-sm font-mono">View leaderboard</Link>
      </div>
    );
  }

  const roleLabel = user.role === "both" ? "Builder & Poster" : user.role === "builder" ? "Builder" : user.role === "poster" ? "Poster" : "Admin";
  const roleColor = user.role === "builder" ? "text-neon bg-neon/10 border-neon/20" : user.role === "poster" ? "text-accent bg-accent/10 border-accent/20" : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/leaderboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 font-mono transition-colors group">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Leaderboard
        </Link>

        <div className="glass rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative flex-shrink-0">
              <img src={user.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}`} alt={user.username} className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl ring-2 ring-accent/30 bg-card" />
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="font-mono text-2xl sm:text-3xl font-bold">{user.display_name || user.username}</h1>
                <span className={cn("inline-flex items-center self-start rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider", roleColor)}>{roleLabel}</span>
              </div>
              <p className="text-muted-foreground font-mono text-sm mb-3">@{user.username}</p>
              {user.bio && <p className="text-muted text-sm leading-relaxed mb-4 max-w-lg">{user.bio}</p>}
              <div className="flex items-center gap-4">
                {user.github_url && (
                  <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="h-4 w-4" /><span className="font-mono">GitHub</span><ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {user.portfolio_url && (
                  <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Globe className="h-4 w-4" /><span className="font-mono">Portfolio</span><ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger-children">
          <div className="glass rounded-xl p-4 text-center card-hover animate-fade-in-up">
            <div className="flex items-center justify-center gap-1.5 mb-2"><Star className="h-4 w-4 text-accent" /></div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-accent">{(user.reputation || 0).toLocaleString()}</div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">Reputation</p>
          </div>
          <div className="glass rounded-xl p-4 text-center card-hover animate-fade-in-up">
            <div className="flex items-center justify-center gap-1.5 mb-2"><DollarSign className="h-4 w-4 text-neon" /></div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-neon">{formatCurrency(user.total_earned || 0)}</div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">Earned</p>
          </div>
          <div className="glass rounded-xl p-4 text-center card-hover animate-fade-in-up">
            <div className="flex items-center justify-center gap-1.5 mb-2"><FileText className="h-4 w-4 text-yellow-400" /></div>
            <div className="font-mono text-xl sm:text-2xl font-bold">{formatCurrency(user.total_posted || 0)}</div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">Posted</p>
          </div>
          <div className="glass rounded-xl p-4 text-center card-hover animate-fade-in-up">
            <div className="flex items-center justify-center gap-1.5 mb-2"><Calendar className="h-4 w-4 text-info" /></div>
            <div className="font-mono text-sm sm:text-base font-bold">{user.created_at ? formatDate(user.created_at) : "N/A"}</div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">Member Since</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <button onClick={() => setActiveTab("bounties")} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-mono font-medium transition-all", activeTab === "bounties" ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]")}>
            <FileText className="h-4 w-4" /> Bounties Posted <span className="text-xs opacity-60">({bounties.length})</span>
          </button>
          <button onClick={() => setActiveTab("submissions")} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-mono font-medium transition-all", activeTab === "submissions" ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]")}>
            <Send className="h-4 w-4" /> Submissions <span className="text-xs opacity-60">({submissions.length})</span>
          </button>
        </div>

        {activeTab === "bounties" ? (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {bounties.length > 0 ? bounties.map((bounty: any) => (
              <Link key={bounty.id} href={`/bounties/${bounty.id}`} className="glass glass-hover rounded-xl p-5 block transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <CategoryBadge category={bounty.category} />
                      <StatusBadge status={bounty.status} />
                    </div>
                    <h3 className="font-mono text-sm sm:text-base font-semibold mb-2 group-hover:text-accent transition-colors">{bounty.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{bounty.brief}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono text-neon font-medium">{formatCurrency(bounty.budget_min)} &mdash; {formatCurrency(bounty.budget_max)}</span>
                      <span className="flex items-center gap-1"><Send className="h-3 w-3" />{bounty.submission_count || 0} submissions</span>
                      {bounty.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeRemaining(bounty.deadline)}</span>}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            )) : (
              <div className="glass rounded-xl p-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No bounties posted yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {submissions.length > 0 ? submissions.map((sub: any) => (
              <Link key={sub.id} href={`/bounties/${sub.bounty_id}`} className="glass glass-hover rounded-xl p-5 block transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <SubmissionStatusBadge status={sub.status} />
                      {sub.score != null && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <Star className="h-3 w-3 fill-yellow-400" />{sub.score}/10
                        </span>
                      )}
                    </div>
                    <h3 className="font-mono text-sm sm:text-base font-semibold mb-1 group-hover:text-accent transition-colors">{sub.title}</h3>
                    {(sub.bounty_title || sub.bounty?.title) && (
                      <p className="text-xs text-muted-foreground mb-2">Submitted to: <span className="text-foreground">{sub.bounty_title || sub.bounty?.title}</span></p>
                    )}
                    {sub.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{sub.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{timeAgo(sub.submitted_at)}</span>
                      {sub.preview_url && <span className="flex items-center gap-1 text-accent"><ExternalLink className="h-3 w-3" />Live preview</span>}
                      {sub.repo_url && <span className="flex items-center gap-1"><Github className="h-3 w-3" />Source</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {sub.status === "winner" && <Trophy className="h-5 w-5 text-yellow-400" />}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Link>
            )) : (
              <div className="glass rounded-xl p-12 text-center">
                <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No submissions yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
