"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Eye,
  Trophy,
  Send,
  Star,
  Clock,
  ArrowUpRight,
  Hammer,
  Megaphone,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { mockUsers, mockBounties, mockSubmissions } from "@/lib/mock-data";
import { cn, formatCurrency, timeAgo, timeRemaining } from "@/lib/utils";
import {
  StatusBadge,
  SubmissionStatusBadge,
  CategoryBadge,
} from "@/components/badges";

type ViewTab = "poster" | "builder";

const currentBuilder = mockUsers[0]; // ghost_coder
const currentPoster = mockUsers[1]; // vibe_queen

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("builder");

  // Poster data
  const posterBounties = useMemo(
    () => mockBounties.filter((b) => b.poster_id === currentPoster.id),
    []
  );
  const posterOpenBounties = posterBounties.filter((b) => b.status === "open");
  const posterInReview = posterBounties.filter(
    (b) => b.status === "in_review"
  );
  const posterAwarded = posterBounties.filter((b) => b.status === "awarded");
  const posterTotalSpent = currentPoster.total_posted;
  const posterSubmissionsToReview = mockSubmissions.filter(
    (s) =>
      posterBounties.some((b) => b.id === s.bounty_id) &&
      (s.status === "live" || s.status === "pending")
  );

  // Builder data
  const builderSubmissions = useMemo(
    () => mockSubmissions.filter((s) => s.builder_id === currentBuilder.id),
    []
  );
  const builderWins = builderSubmissions.filter(
    (s) => s.status === "winner"
  );
  const builderActiveBounties = useMemo(() => {
    const bountyIds = new Set(builderSubmissions.map((s) => s.bounty_id));
    return mockBounties.filter((b) => bountyIds.has(b.id));
  }, [builderSubmissions]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-1">
              <LayoutDashboard className="inline h-8 w-8 mr-3 text-accent" />
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back,{" "}
              <span className="text-foreground font-mono font-medium">
                {activeTab === "builder"
                  ? currentBuilder.display_name
                  : currentPoster.display_name}
              </span>
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="glass rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("builder")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono font-medium transition-all",
                activeTab === "builder"
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Hammer className="h-4 w-4" />
              Builder View
            </button>
            <button
              onClick={() => setActiveTab("poster")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-mono font-medium transition-all",
                activeTab === "poster"
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Megaphone className="h-4 w-4" />
              Poster View
            </button>
          </div>
        </div>

        {activeTab === "builder" ? (
          <BuilderView
            submissions={builderSubmissions}
            wins={builderWins}
            activeBounties={builderActiveBounties}
            user={currentBuilder}
          />
        ) : (
          <PosterView
            bounties={posterBounties}
            openBounties={posterOpenBounties}
            inReviewBounties={posterInReview}
            awardedBounties={posterAwarded}
            totalSpent={posterTotalSpent}
            submissionsToReview={posterSubmissionsToReview}
            user={currentPoster}
          />
        )}
      </div>
    </div>
  );
}

/* ===================== BUILDER VIEW ===================== */

function BuilderView({
  submissions,
  wins,
  activeBounties,
  user,
}: {
  submissions: typeof mockSubmissions;
  wins: typeof mockSubmissions;
  activeBounties: typeof mockBounties;
  user: typeof mockUsers[0];
}) {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 group hover:border-accent/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Send className="h-5 w-5 text-accent" />
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-3xl font-bold mb-1">
            {submissions.length}
          </div>
          <p className="text-sm text-muted-foreground">Submissions Made</p>
        </div>

        <div className="glass rounded-xl p-6 group hover:border-neon/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon/10">
              <DollarSign className="h-5 w-5 text-neon" />
            </div>
            <Zap className="h-4 w-4 text-neon" />
          </div>
          <div className="font-mono text-3xl font-bold text-neon text-glow-neon mb-1">
            {formatCurrency(user.total_earned)}
          </div>
          <p className="text-sm text-muted-foreground">Total Earned</p>
        </div>

        <div className="glass rounded-xl p-6 group hover:border-yellow-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="font-mono text-3xl font-bold mb-1">
            {wins.length}
          </div>
          <p className="text-sm text-muted-foreground">Bounties Won</p>
        </div>
      </div>

      {/* Reputation Bar */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-10 w-10 rounded-full ring-2 ring-accent/30"
            />
            <div>
              <span className="font-mono text-sm font-semibold">
                {user.display_name}
              </span>
              <p className="text-xs text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-accent">
              {user.reputation.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Reputation</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-neon transition-all"
            style={{
              width: `${Math.min((user.reputation / 10000) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          {(10000 - user.reputation).toLocaleString()} rep to next level
        </p>
      </div>

      {/* My Submissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-bold">
            My <span className="text-accent">Submissions</span>
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {submissions.length} total
          </span>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          {submissions.length > 0 ? (
            <div className="divide-y divide-white/5">
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/bounties/${sub.bounty_id}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono text-sm font-semibold truncate group-hover:text-accent transition-colors">
                        {sub.title}
                      </h3>
                      <SubmissionStatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.bounty?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {sub.score !== undefined && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-mono font-medium text-yellow-400">
                          {sub.score}/10
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
                      {timeAgo(sub.submitted_at)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Send className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No submissions yet
              </p>
              <Link
                href="/bounties"
                className="text-accent text-sm font-mono hover:underline mt-1 inline-block"
              >
                Browse bounties
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Active Bounties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-bold">
            Active <span className="text-neon">Bounties</span>
          </h2>
          <Link
            href="/bounties"
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
          >
            Browse all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {activeBounties.map((bounty) => (
            <Link
              key={bounty.id}
              href={`/bounties/${bounty.id}`}
              className="glass glass-hover rounded-xl p-5 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={bounty.category} />
                  <StatusBadge status={bounty.status} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
              </div>
              <h3 className="font-mono text-sm font-semibold mb-2 group-hover:text-accent transition-colors">
                {bounty.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-neon font-medium">
                  {formatCurrency(bounty.budget_min)} &mdash;{" "}
                  {formatCurrency(bounty.budget_max)}
                </span>
                {bounty.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeRemaining(bounty.deadline)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== POSTER VIEW ===================== */

function PosterView({
  bounties,
  openBounties,
  inReviewBounties,
  awardedBounties,
  totalSpent,
  submissionsToReview,
  user,
}: {
  bounties: typeof mockBounties;
  openBounties: typeof mockBounties;
  inReviewBounties: typeof mockBounties;
  awardedBounties: typeof mockBounties;
  totalSpent: number;
  submissionsToReview: typeof mockSubmissions;
  user: typeof mockUsers[0];
}) {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 group hover:border-accent/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-3xl font-bold mb-1">
            {bounties.length}
          </div>
          <p className="text-sm text-muted-foreground">Bounties Posted</p>
        </div>

        <div className="glass rounded-xl p-6 group hover:border-neon/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon/10">
              <DollarSign className="h-5 w-5 text-neon" />
            </div>
            <Zap className="h-4 w-4 text-neon" />
          </div>
          <div className="font-mono text-3xl font-bold text-neon text-glow-neon mb-1">
            {formatCurrency(totalSpent)}
          </div>
          <p className="text-sm text-muted-foreground">Total Spent</p>
        </div>

        <div className="glass rounded-xl p-6 group hover:border-yellow-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Eye className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] font-mono font-bold text-yellow-400">
              {submissionsToReview.length}
            </span>
          </div>
          <div className="font-mono text-3xl font-bold mb-1">
            {submissionsToReview.length}
          </div>
          <p className="text-sm text-muted-foreground">
            Submissions to Review
          </p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="glass rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="h-10 w-10 rounded-full ring-2 ring-accent/30"
          />
          <div>
            <span className="font-mono text-sm font-semibold">
              {user.display_name}
            </span>
            <p className="text-xs text-muted-foreground">
              {bounties.length} bounties &middot;{" "}
              {formatCurrency(totalSpent)} invested
            </p>
          </div>
        </div>
        <Link
          href="/bounties/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          <Zap className="h-4 w-4" />
          Post New Bounty
        </Link>
      </div>

      {/* My Bounties - Grouped by Status */}
      <div>
        <h2 className="font-mono text-lg font-bold mb-5">
          My <span className="text-accent">Bounties</span>
        </h2>

        {/* Open Bounties */}
        {openBounties.length > 0 && (
          <BountySection
            title="Open"
            count={openBounties.length}
            dotColor="bg-neon"
            bounties={openBounties}
          />
        )}

        {/* In Review */}
        {inReviewBounties.length > 0 && (
          <BountySection
            title="In Review"
            count={inReviewBounties.length}
            dotColor="bg-yellow-400"
            bounties={inReviewBounties}
          />
        )}

        {/* Awarded */}
        {awardedBounties.length > 0 && (
          <BountySection
            title="Awarded"
            count={awardedBounties.length}
            dotColor="bg-accent"
            bounties={awardedBounties}
          />
        )}

        {bounties.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No bounties posted yet
            </p>
            <Link
              href="/bounties/new"
              className="text-accent text-sm font-mono hover:underline mt-1 inline-block"
            >
              Post your first bounty
            </Link>
          </div>
        )}
      </div>

      {/* Submissions to Review */}
      {submissionsToReview.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-lg font-bold">
              Pending{" "}
              <span className="text-yellow-400">Reviews</span>
            </h2>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-mono font-bold text-yellow-400 animate-pulse-dot">
              {submissionsToReview.length}
            </span>
          </div>
          <div className="glass rounded-xl overflow-hidden divide-y divide-white/5">
            {submissionsToReview.map((sub) => (
              <Link
                key={sub.id}
                href={`/bounties/${sub.bounty_id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
              >
                {sub.builder && (
                  <img
                    src={sub.builder.avatar_url}
                    alt={sub.builder.username}
                    className="h-8 w-8 rounded-full ring-1 ring-white/10"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-sm font-semibold truncate group-hover:text-accent transition-colors">
                    {sub.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    by @{sub.builder?.username} &middot;{" "}
                    {sub.bounty?.title}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <SubmissionStatusBadge status={sub.status} />
                  <span className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-mono font-medium text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    Review
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== SHARED COMPONENTS ===================== */

function BountySection({
  title,
  count,
  dotColor,
  bounties,
}: {
  title: string;
  count: number;
  dotColor: string;
  bounties: typeof mockBounties;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn("h-2 w-2 rounded-full", dotColor)}
        />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          ({count})
        </span>
      </div>
      <div className="glass rounded-xl overflow-hidden divide-y divide-white/5">
        {bounties.map((bounty) => {
          const subs = mockSubmissions.filter(
            (s) => s.bounty_id === bounty.id
          );
          return (
            <Link
              key={bounty.id}
              href={`/bounties/${bounty.id}`}
              className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-mono text-sm font-semibold truncate group-hover:text-accent transition-colors">
                    {bounty.title}
                  </h3>
                  <CategoryBadge category={bounty.category} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {bounty.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeRemaining(bounty.deadline)}
                    </span>
                  )}
                  <span>{timeAgo(bounty.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-neon">
                    {formatCurrency(bounty.budget_max)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    budget
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {subs.length}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    subs
                  </div>
                </div>
                <StatusBadge status={bounty.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
