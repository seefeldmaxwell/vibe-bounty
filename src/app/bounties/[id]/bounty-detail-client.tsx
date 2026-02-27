"use client";

import Link from "next/link";
import {
  Clock,
  Users,
  ArrowLeft,
  ExternalLink,
  Github,
  Send,
  Star,
  Calendar,
  Tag,
  MessageSquare,
} from "lucide-react";
import { mockBounties, mockSubmissions, mockComments } from "@/lib/mock-data";
import {
  cn,
  formatCurrency,
  timeRemaining,
  timeAgo,
  formatDate,
} from "@/lib/utils";
import {
  CategoryBadge,
  DifficultyBadge,
  StatusBadge,
  SubmissionStatusBadge,
} from "@/components/badges";

export default function BountyDetailClient({ id }: { id: string }) {
  const bounty = mockBounties.find((b) => b.id === id);

  if (!bounty) {
    return (
      <div className="px-4 py-32 text-center">
        <h1 className="font-mono text-2xl font-bold mb-2">Bounty not found</h1>
        <Link href="/bounties" className="text-accent hover:underline text-sm font-mono">
          Back to bounties
        </Link>
      </div>
    );
  }

  const submissions = mockSubmissions.filter((s) => s.bounty_id === bounty.id);
  const comments = mockComments.filter((c) => c.bounty_id === bounty.id);
  const deadlineText = bounty.deadline ? timeRemaining(bounty.deadline) : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/bounties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-mono transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to bounties
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <CategoryBadge category={bounty.category} />
                <DifficultyBadge difficulty={bounty.difficulty} />
                <StatusBadge status={bounty.status} />
              </div>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold mb-4">
                {bounty.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {bounty.poster && (
                  <Link
                    href={`/profile/${bounty.poster.username}`}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <img
                      src={bounty.poster.avatar_url}
                      alt={bounty.poster.username}
                      className="h-6 w-6 rounded-full bg-border"
                    />
                    <span className="font-mono">{bounty.poster.username}</span>
                  </Link>
                )}
                <span>·</span>
                <span>{timeAgo(bounty.created_at)}</span>
              </div>
            </div>

            {/* Brief */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                Brief
              </h2>
              <p className="text-foreground leading-relaxed">{bounty.brief}</p>
            </div>

            {/* Detailed Spec */}
            {bounty.detailed_spec && (
              <div className="glass rounded-xl p-6">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Detailed Spec
                </h2>
                <div className="prose prose-invert prose-sm max-w-none text-muted">
                  {bounty.detailed_spec.split("\n").map((line, i) => {
                    if (line.startsWith("## "))
                      return (
                        <h3
                          key={i}
                          className="font-mono text-base font-semibold text-foreground mt-4 mb-2"
                        >
                          {line.replace("## ", "")}
                        </h3>
                      );
                    if (line.startsWith("- "))
                      return (
                        <div key={i} className="flex gap-2 ml-2 mb-1">
                          <span className="text-accent">·</span>
                          <span className="text-muted">{line.replace("- ", "")}</span>
                        </div>
                      );
                    if (line.trim() === "") return <div key={i} className="h-2" />;
                    return (
                      <p key={i} className="text-muted mb-1">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {bounty.tech_stack.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {bounty.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-sm font-mono text-accent"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submissions */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted">
                  Submissions ({submissions.length})
                </h2>
              </div>
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/submissions/${sub.id}`}
                      className="block glass glass-hover rounded-lg p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-mono text-sm font-semibold truncate">
                              {sub.title}
                            </h3>
                            <SubmissionStatusBadge status={sub.status} />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {sub.description}
                          </p>
                          <div className="flex items-center gap-3">
                            {sub.builder && (
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={sub.builder.avatar_url}
                                  alt={sub.builder.username}
                                  className="h-4 w-4 rounded-full"
                                />
                                <span className="text-xs text-muted-foreground font-mono">
                                  {sub.builder.username}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(sub.submitted_at)}
                            </span>
                            {sub.score !== undefined && (
                              <span className="flex items-center gap-1 text-xs text-warning">
                                <Star className="h-3 w-3 fill-current" />
                                {sub.score}/10
                              </span>
                            )}
                          </div>
                        </div>
                        {sub.preview_url && (
                          <span className="text-xs text-accent font-mono flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Preview
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No submissions yet. Be the first!
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Discussion ({comments.length})
              </h2>
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                    >
                      {comment.user && (
                        <img
                          src={comment.user.avatar_url}
                          alt={comment.user.username}
                          className="h-7 w-7 rounded-full flex-shrink-0 mt-0.5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono font-semibold">
                            {comment.user?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet.
                </p>
              )}

              {/* Comment input */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
                  />
                  <button className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget card */}
            <div className="glass rounded-xl p-6 glow-neon">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Bounty
              </h3>
              <div className="font-mono text-3xl font-bold text-neon text-glow-neon mb-4">
                {formatCurrency(bounty.budget_min)} —{" "}
                {formatCurrency(bounty.budget_max)}
              </div>
              <Link
                href={`/bounties/${bounty.id}/submit`}
                className="block w-full text-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
              >
                Submit Solution
              </Link>
            </div>

            {/* Info card */}
            <div className="glass rounded-xl p-6 space-y-4">
              {deadlineText && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Deadline
                  </span>
                  <span
                    className={cn(
                      "text-sm font-mono font-medium",
                      deadlineText === "Expired" ? "text-danger" : "text-foreground"
                    )}
                  >
                    {deadlineText}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Submissions
                </span>
                <span className="text-sm font-mono font-medium">
                  {bounty.submission_count}/{bounty.max_submissions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Posted
                </span>
                <span className="text-sm font-mono font-medium">
                  {formatDate(bounty.created_at)}
                </span>
              </div>
            </div>

            {/* Tags */}
            {bounty.tags.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                  <Tag className="h-3.5 w-3.5 inline mr-1" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bounty.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Poster card */}
            {bounty.poster && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                  Posted by
                </h3>
                <Link
                  href={`/profile/${bounty.poster.username}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={bounty.poster.avatar_url}
                    alt={bounty.poster.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="font-mono text-sm font-semibold">
                      {bounty.poster.display_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{bounty.poster.username}
                    </div>
                  </div>
                </Link>
                <div className="mt-3 text-xs text-muted-foreground">
                  {bounty.poster.bio}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(bounty.poster.total_posted)}
                    </span>{" "}
                    posted
                  </span>
                  <span>
                    <span className="text-foreground font-medium">
                      {bounty.poster.reputation}
                    </span>{" "}
                    rep
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
