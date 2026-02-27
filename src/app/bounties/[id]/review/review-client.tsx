"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, DollarSign, Trophy, Star, ExternalLink, Github,
  MessageSquare, Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { SubmissionStatusBadge } from "@/components/badges";
import { api } from "@/lib/api";
import type { Bounty, Submission } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";

function parseTags(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

export default function ReviewPortalClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    Promise.all([
      api.bounties.get(id),
      api.submissions.list({ bounty_id: id }),
    ])
      .then(([b, s]) => { setBounty(b); setSubmissions(s || []); })
      .catch(() => toast("Failed to load review data", "error"))
      .finally(() => setLoading(false));
  }, [id, authLoading, user]);

  const refreshSubmissions = () => {
    api.submissions.list({ bounty_id: id }).then((s) => setSubmissions(s || [])).catch(() => {});
  };

  if (loading || authLoading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (!bounty) {
    return <div className="px-4 py-32 text-center"><h1 className="font-mono text-2xl font-bold mb-2">Bounty not found</h1></div>;
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link href={`/bounties/${bounty.id}`} className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold font-mono text-foreground truncate">Review Submissions</h1>
                <p className="text-sm text-muted-foreground truncate">{bounty.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-neon font-mono font-bold text-lg shrink-0">
              <DollarSign className="w-5 h-5" />{formatCurrency(bounty.budget_max)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-xl border border-border p-4 mb-8 flex items-center gap-8 flex-wrap animate-fade-in-up">
          <div>
            <p className="text-xs text-muted-foreground font-mono">Total Submissions</p>
            <p className="text-2xl font-bold font-mono text-foreground">{submissions.length}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-xs text-muted-foreground font-mono">Reviewed</p>
            <p className="text-2xl font-bold font-mono text-accent">{submissions.filter((s) => s.score != null).length}</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-xs text-muted-foreground font-mono">Awarded</p>
            <p className="text-2xl font-bold font-mono text-neon">{submissions.filter((s) => s.status === "winner").length}</p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="glass rounded-2xl border border-border p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold font-mono text-foreground mb-2">No submissions yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Builders are still working on their entries. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 stagger-children">
            {submissions.map((submission) => (
              <SubmissionReviewCard key={submission.id} submission={submission} bountyId={id} onUpdate={refreshSubmissions} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SubmissionReviewCard({ submission, bountyId, onUpdate }: { submission: any; bountyId: string; onUpdate: () => void }) {
  const { toast } = useToast();
  const [score, setScore] = useState(submission.score ?? 5);
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const isAwarded = submission.status === "winner";
  const techUsed = parseTags(submission.tech_used);

  const builderName = submission.builder_display_name || submission.builder_username || submission.builder?.display_name || "Unknown";
  const builderUsername = submission.builder_username || submission.builder?.username || "unknown";
  const builderAvatar = submission.builder_avatar_url || submission.builder?.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${builderUsername}`;

  const handleScore = async () => {
    setSaving(true);
    try {
      await api.submissions.score(submission.id, score, feedback);
      toast("Review saved!", "success");
      onUpdate();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save review", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAward = async () => {
    setAwarding(true);
    try {
      await api.bounties.award(bountyId, submission.id);
      toast("Bounty awarded!", "success");
      onUpdate();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to award bounty", "error");
    } finally {
      setAwarding(false);
    }
  };

  return (
    <div className="glass rounded-2xl border border-border overflow-hidden animate-fade-in-up card-hover">
      <div className="relative aspect-video bg-black/50 border-b border-border">
        {submission.preview_url ? (
          <iframe src={submission.preview_url} title={submission.title ?? "Preview"} className="w-full h-full" sandbox="allow-scripts" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground font-mono">No live preview available</p>
          </div>
        )}
        <div className="absolute top-3 right-3"><SubmissionStatusBadge status={submission.status} /></div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <img src={builderAvatar} alt={builderName} className="w-10 h-10 rounded-lg border border-border shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-bold font-mono text-foreground truncate">{submission.title ?? "Untitled"}</h3>
            <p className="text-sm text-muted-foreground">
              by <Link href={`/profile/${builderUsername}`} className="text-accent hover:text-accent-hover transition-colors">{builderName}</Link>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {submission.repo_url && (
              <a href={submission.repo_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-surface hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
            )}
            {submission.preview_url && (
              <a href={submission.preview_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-surface hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {techUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techUsed.map((tech: string) => (
              <span key={tech} className="px-2 py-0.5 text-xs font-mono bg-accent/10 border border-accent/20 rounded-md text-accent">{tech}</span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/80 font-mono flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning" /> Score
            </label>
            <span className={cn("text-lg font-bold font-mono", score >= 8 ? "text-neon" : score >= 5 ? "text-warning" : "text-danger")}>{score}/10</span>
          </div>
          <input type="range" min="1" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0" />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50"><span>1</span><span>5</span><span>10</span></div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80 font-mono">Feedback</label>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value.slice(0, 5000))} placeholder="Share your thoughts..." rows={3} maxLength={5000}
            className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm resize-none" />
        </div>

        <div className="flex gap-3">
          <button onClick={handleScore} disabled={saving} className="flex-1 py-3 font-semibold rounded-xl transition-all duration-200 font-mono flex items-center justify-center gap-2 bg-surface border border-border hover:border-accent/30 text-foreground disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Review"}
          </button>
          {!isAwarded && (
            <button onClick={handleAward} disabled={awarding} className="flex-1 py-3 font-semibold rounded-xl transition-all duration-200 font-mono flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white glow-accent hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
              {awarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
              {awarding ? "Awarding..." : "Award Bounty"}
            </button>
          )}
          {isAwarded && (
            <div className="flex-1 py-3 font-semibold rounded-xl font-mono flex items-center justify-center gap-2 bg-neon/20 text-neon border border-neon/30">
              <Trophy className="w-4 h-4" /> Awarded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
