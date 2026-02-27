"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Github, Star, Calendar, Tag,
  MessageSquare, DollarSign, Award, Clock, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { cn, formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { SubmissionStatusBadge } from "@/components/badges";
import { api } from "@/lib/api";

function parseTags(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

export default function SubmissionDetailClient({ id }: { id: string }) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.submissions.get(id)
      .then(setSubmission)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (!submission) {
    return (
      <div className="px-4 py-32 text-center">
        <h1 className="font-mono text-2xl font-bold mb-2">Submission not found</h1>
        <Link href="/bounties" className="text-accent hover:underline text-sm font-mono">Browse bounties</Link>
      </div>
    );
  }

  const techUsed = parseTags(submission.tech_used);
  const hasReview = submission.score != null;
  const builderName = submission.builder_display_name || submission.builder?.display_name || submission.builder_username || "Unknown";
  const builderUsername = submission.builder_username || submission.builder?.username || "unknown";
  const builderAvatar = submission.builder_avatar_url || submission.builder?.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${builderUsername}`;
  const builderRep = submission.builder_reputation || submission.builder?.reputation || 0;
  const builderEarned = submission.builder_total_earned || submission.builder?.total_earned || 0;
  const bountyTitle = submission.bounty_title || submission.bounty?.title;
  const bountyId = submission.bounty_id;
  const bountyBudgetMin = submission.bounty_budget_min || submission.bounty?.budget_min || 0;
  const bountyBudgetMax = submission.bounty_budget_max || submission.bounty?.budget_max || 0;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/bounties/${bountyId}`} className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold font-mono text-foreground truncate">{submission.title ?? "Untitled Submission"}</h1>
              <p className="text-sm text-muted-foreground">Submission detail</p>
            </div>
            <SubmissionStatusBadge status={submission.status} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative aspect-video bg-black/50 rounded-2xl border border-border overflow-hidden mb-8">
          {submission.preview_url ? (
            <iframe src={submission.preview_url} title={submission.title ?? "Preview"} className="w-full h-full" sandbox="allow-scripts allow-same-origin" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center"><ExternalLink className="w-8 h-8 text-muted-foreground" /></div>
              <p className="text-sm text-muted-foreground font-mono">No live preview available</p>
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            {submission.preview_url && (
              <a href={submission.preview_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-border text-sm font-mono text-foreground hover:border-border-bright transition-colors">
                <ExternalLink className="w-4 h-4" /> Open Live
              </a>
            )}
            {submission.repo_url && (
              <a href={submission.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg glass border border-border text-sm font-mono text-foreground hover:border-border-bright transition-colors">
                <Github className="w-4 h-4" /> View Repo
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold font-mono text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{submission.description ?? "No description provided."}</p>
            </div>

            {techUsed.length > 0 && (
              <div className="glass rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold font-mono text-foreground mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-accent" /> Tech Used</h2>
                <div className="flex flex-wrap gap-2">
                  {techUsed.map((tech: string) => (
                    <span key={tech} className="px-3 py-1.5 text-sm font-mono bg-accent/10 border border-accent/20 rounded-lg text-accent">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            {hasReview && (
              <div className="glass rounded-2xl border border-border p-6">
                <h2 className="text-lg font-bold font-mono text-foreground mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-accent" /> Review</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-warning" />
                    <span className={cn("text-3xl font-bold font-mono", submission.score >= 8 ? "text-neon" : submission.score >= 5 ? "text-warning" : "text-danger")}>{submission.score}</span>
                    <span className="text-lg text-muted-foreground font-mono">/10</span>
                  </div>
                  <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", submission.score >= 8 ? "bg-neon" : submission.score >= 5 ? "bg-warning" : "bg-danger")} style={{ width: `${(submission.score / 10) * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {submission.status === "winner" ? (<><CheckCircle2 className="w-5 h-5 text-neon" /><span className="text-neon font-mono font-semibold">Bounty Awarded</span></>)
                    : submission.status === "rejected" ? (<><XCircle className="w-5 h-5 text-danger" /><span className="text-danger font-mono font-semibold">Not Selected</span></>)
                    : (<><Clock className="w-5 h-5 text-info" /><span className="text-info font-mono font-semibold">Under Review</span></>)}
                </div>
                {submission.feedback && (
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">{submission.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl border border-border p-6">
              <h3 className="text-sm font-mono font-semibold text-muted-foreground mb-4">Builder</h3>
              <Link href={`/profile/${builderUsername}`} className="flex items-center gap-3 group">
                <img src={builderAvatar} alt={builderName} className="w-12 h-12 rounded-xl border border-border group-hover:border-accent/50 transition-colors" />
                <div>
                  <p className="font-bold font-mono text-foreground group-hover:text-accent transition-colors">{builderName}</p>
                  <p className="text-sm text-muted-foreground">@{builderUsername}</p>
                </div>
              </Link>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-card rounded-lg border border-border text-center">
                  <p className="text-lg font-bold font-mono text-foreground">{builderRep}</p>
                  <p className="text-xs text-muted-foreground">Reputation</p>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border text-center">
                  <p className="text-lg font-bold font-mono text-neon">{formatCurrency(builderEarned)}</p>
                  <p className="text-xs text-muted-foreground">Earned</p>
                </div>
              </div>
            </div>

            {bountyTitle && (
              <div className="glass rounded-2xl border border-border p-6">
                <h3 className="text-sm font-mono font-semibold text-muted-foreground mb-4">Bounty</h3>
                <Link href={`/bounties/${bountyId}`} className="block group">
                  <h4 className="font-bold font-mono text-foreground group-hover:text-accent transition-colors mb-2">{bountyTitle}</h4>
                  <div className="flex items-center gap-1.5 text-neon font-mono font-bold">
                    <DollarSign className="w-4 h-4" />{formatCurrency(bountyBudgetMin)} - {formatCurrency(bountyBudgetMax)}
                  </div>
                </Link>
              </div>
            )}

            <div className="glass rounded-2xl border border-border p-6">
              <h3 className="text-sm font-mono font-semibold text-muted-foreground mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="text-foreground font-mono ml-auto">{timeAgo(submission.submitted_at)}</span>
                </div>
                {submission.reviewed_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Reviewed</span>
                    <span className="text-foreground font-mono ml-auto">{formatDate(submission.reviewed_at)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {submission.preview_url && (
                <a href={submission.preview_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] font-mono">
                  <ExternalLink className="w-4 h-4" /> View Live Demo
                </a>
              )}
              {submission.repo_url && (
                <a href={submission.repo_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-card hover:bg-card-hover border border-border text-foreground font-semibold rounded-xl transition-all font-mono">
                  <Github className="w-4 h-4" /> View Repository
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
