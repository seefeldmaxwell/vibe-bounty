"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import {
  Clock,
  Users,
  ArrowLeft,
  ExternalLink,
  Send,
  Star,
  Calendar,
  Tag,
  MessageSquare,
  Eye,
  Loader2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTags(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return [];
}

/** Normalise poster info that may arrive as flat fields or nested object. */
function normalisePoster(bounty: any) {
  if (bounty.poster && typeof bounty.poster === "object") return bounty.poster;
  if (bounty.poster_username) {
    return {
      username: bounty.poster_username,
      avatar_url: bounty.poster_avatar_url || bounty.poster_avatar,
      display_name: bounty.poster_display_name,
      reputation: bounty.poster_reputation,
      total_posted: bounty.poster_total_posted,
      bio: bounty.poster_bio,
    };
  }
  return null;
}

/** Normalise builder info on a submission. */
function normaliseBuilder(sub: any) {
  if (sub.builder && typeof sub.builder === "object") return sub.builder;
  if (sub.builder_username) {
    return {
      username: sub.builder_username,
      display_name: sub.builder_display_name,
      avatar_url: sub.builder_avatar_url || sub.builder_avatar,
    };
  }
  return null;
}

/** Normalise user info on a comment. */
function normaliseCommentUser(comment: any) {
  if (comment.user && typeof comment.user === "object") return comment.user;
  // API returns username, display_name, avatar_url directly on comment
  if (comment.username) {
    return {
      username: comment.username,
      display_name: comment.display_name,
      avatar_url: comment.avatar_url,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/5",
        className
      )}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back link placeholder */}
        <Skeleton className="h-4 w-32 mb-6" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Brief */}
            <div className="glass rounded-xl p-6">
              <Skeleton className="h-4 w-12 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Spec */}
            <div className="glass rounded-xl p-6">
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Submissions */}
            <div className="glass rounded-xl p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-16 w-full" />
            </div>

            {/* Comments */}
            <div className="glass rounded-xl p-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <Skeleton className="h-4 w-16 mb-3" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="glass rounded-xl p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="glass rounded-xl p-6">
              <Skeleton className="h-4 w-16 mb-3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BountyDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data state
  const [bounty, setBounty] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  // Loading / error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Comment form state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch data
  // -----------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const [bountyData, submissionsData, commentsData] = await Promise.all([
          api.bounties.get(id),
          api.submissions.list({ bounty_id: id }),
          api.comments.list(id),
        ]);

        if (cancelled) return;

        setBounty(bountyData);
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : "Something went wrong. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // -----------------------------------------------------------------------
  // Comment submission
  // -----------------------------------------------------------------------

  async function handleCommentSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setSubmittingComment(true);
    try {
      await api.comments.create({ bounty_id: id, content: trimmed });
      setCommentText("");
      // Refresh comments
      const updated = await api.comments.list(id);
      setComments(Array.isArray(updated) ? updated : []);
      toast("Comment posted", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to post comment",
        "error"
      );
    } finally {
      setSubmittingComment(false);
    }
  }

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  if (loading) return <LoadingSkeleton />;

  // -----------------------------------------------------------------------
  // 404 state
  // -----------------------------------------------------------------------

  if (notFound) {
    return (
      <div className="px-4 py-32 text-center">
        <h1 className="font-mono text-2xl font-bold mb-2">Bounty not found</h1>
        <Link
          href="/bounties"
          className="text-accent hover:underline text-sm font-mono"
        >
          Back to bounties
        </Link>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------

  if (error || !bounty) {
    return (
      <div className="px-4 py-32 text-center">
        <h1 className="font-mono text-2xl font-bold mb-2">
          {error || "Failed to load bounty"}
        </h1>
        <Link
          href="/bounties"
          className="text-accent hover:underline text-sm font-mono"
        >
          Back to bounties
        </Link>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const poster = normalisePoster(bounty);
  const tags = parseTags(bounty.tags);
  const techStack = parseTags(bounty.tech_stack);
  const deadlineText = bounty.deadline ? timeRemaining(bounty.deadline) : null;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/bounties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-mono transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to bounties
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up">
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
                {poster && (
                  <Link
                    href={`/profile/${poster.username}`}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <img
                      src={poster.avatar_url}
                      alt={poster.username}
                      className="h-6 w-6 rounded-full bg-border"
                    />
                    <span className="font-mono">{poster.username}</span>
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
                  {bounty.detailed_spec.split("\n").map((line: string, i: number) => {
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
                          <span className="text-muted">
                            {line.replace("- ", "")}
                          </span>
                        </div>
                      );
                    if (line.trim() === "")
                      return <div key={i} className="h-2" />;
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
            {techStack.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
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
                  {submissions.map((sub) => {
                    const builder = normaliseBuilder(sub);
                    return (
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
                              {builder && (
                                <div className="flex items-center gap-1.5">
                                  <img
                                    src={builder.avatar_url}
                                    alt={builder.username}
                                    className="h-4 w-4 rounded-full"
                                  />
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {builder.username}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(sub.submitted_at)}
                              </span>
                              {sub.score !== undefined && sub.score !== null && (
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
                    );
                  })}
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
                  {comments.map((comment) => {
                    const commentUser = normaliseCommentUser(comment);
                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        {commentUser && (
                          <img
                            src={commentUser.avatar_url}
                            alt={commentUser.username}
                            className="h-7 w-7 rounded-full flex-shrink-0 mt-0.5"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono font-semibold">
                              {commentUser?.username}
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
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet.
                </p>
              )}

              {/* Comment input */}
              <div className="mt-4 pt-4 border-t border-white/5">
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      disabled={submittingComment}
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    <Link
                      href="/login"
                      className="text-accent hover:underline font-mono"
                    >
                      Log in to comment
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {/* Budget card */}
            <div className="glass rounded-xl p-6 glow-neon">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Bounty
              </h3>
              <div className="font-mono text-3xl font-bold text-neon text-glow-neon mb-4">
                {formatCurrency(bounty.budget_min)} —{" "}
                {formatCurrency(bounty.budget_max)}
              </div>
              {user && user.id === bounty.poster_id ? (
                <div className="space-y-2">
                  <Link
                    href={`/bounties/${bounty.id}/review`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Review Submissions
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/bounties/${bounty.id}/submit`}
                  className="block w-full text-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
                >
                  Submit Solution
                </Link>
              )}
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
                      deadlineText === "Expired"
                        ? "text-danger"
                        : "text-foreground"
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
            {tags.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                  <Tag className="h-3.5 w-3.5 inline mr-1" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
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
            {poster && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                  Posted by
                </h3>
                <Link
                  href={`/profile/${poster.username}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={poster.avatar_url}
                    alt={poster.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="font-mono text-sm font-semibold">
                      {poster.display_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{poster.username}
                    </div>
                  </div>
                </Link>
                <div className="mt-3 text-xs text-muted-foreground">
                  {poster.bio}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(poster.total_posted)}
                    </span>{" "}
                    posted
                  </span>
                  <span>
                    <span className="text-foreground font-medium">
                      {poster.reputation}
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
