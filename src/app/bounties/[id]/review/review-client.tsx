"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  DollarSign,
  Trophy,
  Star,
  ExternalLink,
  Github,
  MessageSquare,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { mockBounties, mockSubmissions, mockUsers } from "@/lib/mock-data";
import { SubmissionStatusBadge } from "@/components/badges";
import type { Submission } from "@/lib/types";

export default function ReviewPortalClient({ id }: { id: string }) {
  const bounty = mockBounties.find((b) => b.id === id) ?? mockBounties[0];
  const submissions = mockSubmissions.filter((s) => s.bounty_id === bounty.id);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href={`/bounties/${bounty.id}`}
                className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold font-mono text-foreground truncate">
                  Review Submissions
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                  {bounty.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-neon font-mono font-bold text-lg shrink-0">
              <DollarSign className="w-5 h-5" />
              {formatCurrency(bounty.budget_max)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        <div className="glass rounded-xl border border-border p-4 mb-8 flex items-center gap-8 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground font-mono">
              Total Submissions
            </p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {submissions.length}
            </p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-xs text-muted-foreground font-mono">Reviewed</p>
            <p className="text-2xl font-bold font-mono text-accent">
              {submissions.filter((s) => s.score != null).length}
            </p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <p className="text-xs text-muted-foreground font-mono">
              Awarded
            </p>
            <p className="text-2xl font-bold font-mono text-neon">
              {submissions.filter((s) => s.status === "winner").length}
            </p>
          </div>
        </div>

        {/* Submissions Grid */}
        {submissions.length === 0 ? (
          <div className="glass rounded-2xl border border-border p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold font-mono text-foreground mb-2">
              No submissions yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Builders are still working on their entries. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {submissions.map((submission) => (
              <SubmissionReviewCard
                key={submission.id}
                submission={submission}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionReviewCard({
  submission,
}: {
  submission: Submission;
}) {
  const builder = submission.builder ?? mockUsers.find((u) => u.id === submission.builder_id);
  const [score, setScore] = useState(submission.score ?? 5);
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [awarded, setAwarded] = useState(submission.status === "winner");

  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      {/* Live Preview */}
      <div className="relative aspect-video bg-black/50 border-b border-border">
        {submission.preview_url ? (
          <iframe
            src={submission.preview_url}
            title={submission.title ?? "Submission preview"}
            className="w-full h-full rounded-t-2xl"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground font-mono">
              No live preview available
            </p>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <SubmissionStatusBadge status={submission.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Builder Info & Title */}
        <div className="flex items-start gap-3">
          {builder?.avatar_url && (
            <Image
              src={builder.avatar_url}
              alt={builder.display_name ?? builder.username}
              width={40}
              height={40}
              className="rounded-lg border border-border shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold font-mono text-foreground truncate">
              {submission.title ?? "Untitled Submission"}
            </h3>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <Link
                href={`/profile/${builder?.username}`}
                className="text-accent hover:text-accent-hover transition-colors"
              >
                {builder?.display_name ?? "Unknown Builder"}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {submission.repo_url && (
              <Link
                href={submission.repo_url}
                target="_blank"
                className="p-2 rounded-lg bg-surface hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
              </Link>
            )}
            {submission.preview_url && (
              <Link
                href={submission.preview_url}
                target="_blank"
                className="p-2 rounded-lg bg-surface hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Tech Used */}
        {submission.tech_used.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {submission.tech_used.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs font-mono bg-accent/10 border border-accent/20 rounded-md text-accent"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Score Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground/80 font-mono flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning" />
              Score
            </label>
            <span
              className={cn(
                "text-lg font-bold font-mono",
                score >= 8
                  ? "text-neon"
                  : score >= 5
                    ? "text-warning"
                    : "text-danger"
              )}
            >
              {score}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0"
          />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80 font-mono">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts on this submission..."
            rows={3}
            className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm resize-none"
          />
        </div>

        {/* Award Button */}
        <button
          onClick={() => setAwarded(!awarded)}
          className={cn(
            "w-full py-3 font-semibold rounded-xl transition-all duration-200 font-mono flex items-center justify-center gap-2",
            awarded
              ? "bg-neon/20 text-neon border border-neon/30 hover:bg-neon/30"
              : "bg-accent hover:bg-accent-hover text-white glow-accent hover:scale-[1.01] active:scale-[0.99]"
          )}
        >
          <Trophy className="w-4 h-4" />
          {awarded ? "Bounty Awarded" : "Award Bounty"}
        </button>
      </div>
    </div>
  );
}
