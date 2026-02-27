"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  Flame,
  Target,
} from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

type LeaderboardTab = "builders" | "posters";

const rankMedals: Record<number, { icon: typeof Crown; color: string; bg: string; glow: string }> = {
  1: {
    icon: Crown,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    glow: "shadow-yellow-400/20 shadow-lg",
  },
  2: {
    icon: Medal,
    color: "text-gray-300",
    bg: "bg-gray-300/10 border-gray-300/30",
    glow: "shadow-gray-300/10 shadow-md",
  },
  3: {
    icon: Medal,
    color: "text-amber-600",
    bg: "bg-amber-600/10 border-amber-600/30",
    glow: "shadow-amber-600/10 shadow-md",
  },
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("builders");

  const topBuilders = useMemo(
    () =>
      [...mockUsers]
        .filter((u) => u.role === "builder" || u.role === "both")
        .sort((a, b) => b.reputation - a.reputation),
    []
  );

  const topPosters = useMemo(
    () =>
      [...mockUsers]
        .filter((u) => u.role === "poster" || u.role === "both")
        .sort((a, b) => b.total_posted - a.total_posted),
    []
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-2">
            Leader<span className="text-accent">board</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            The top builders and posters on VibeBounty. Ship code, earn rep,
            climb the ranks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="glass rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("builders")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-mono font-medium transition-all",
                activeTab === "builders"
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flame className="h-4 w-4" />
              Top Builders
            </button>
            <button
              onClick={() => setActiveTab("posters")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-mono font-medium transition-all",
                activeTab === "posters"
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="h-4 w-4" />
              Top Posters
            </button>
          </div>
        </div>

        {activeTab === "builders" ? (
          <BuilderLeaderboard users={topBuilders} />
        ) : (
          <PosterLeaderboard users={topPosters} />
        )}
      </div>
    </div>
  );
}

/* ===================== BUILDER LEADERBOARD ===================== */

function BuilderLeaderboard({ users }: { users: typeof mockUsers }) {
  return (
    <div className="space-y-3">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {users.slice(0, 3).map((user, index) => {
          const rank = index + 1;
          const medal = rankMedals[rank];
          const MedalIcon = medal.icon;

          return (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className={cn(
                "glass rounded-xl p-6 text-center transition-all hover:scale-[1.02] border",
                medal.bg,
                medal.glow,
                rank === 1 && "sm:order-none order-first sm:-mt-4"
              )}
            >
              <div className="relative inline-block mb-3">
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className={cn(
                    "h-16 w-16 rounded-full ring-2 mx-auto",
                    rank === 1
                      ? "ring-yellow-400/50"
                      : rank === 2
                      ? "ring-gray-300/50"
                      : "ring-amber-600/50"
                  )}
                />
                <div
                  className={cn(
                    "absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold",
                    rank === 1
                      ? "bg-yellow-400 text-black"
                      : rank === 2
                      ? "bg-gray-300 text-black"
                      : "bg-amber-600 text-white"
                  )}
                >
                  {rank}
                </div>
              </div>
              <MedalIcon
                className={cn("h-5 w-5 mx-auto mb-2", medal.color)}
              />
              <h3 className="font-mono text-sm font-bold mb-0.5">
                {user.display_name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                @{user.username}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-accent" />
                  <span className="font-mono text-sm font-semibold text-accent">
                    {user.reputation.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">rep</span>
                </div>
                <div className="font-mono text-sm font-semibold text-neon">
                  {formatCurrency(user.total_earned)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Builder</div>
        <div className="col-span-2 text-right">Reputation</div>
        <div className="col-span-2 text-right">Earned</div>
        <div className="col-span-2 text-right">Won</div>
      </div>

      {/* Remaining Rows */}
      {users.slice(3).map((user, index) => {
        const rank = index + 4;
        return (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="glass glass-hover rounded-xl grid grid-cols-12 gap-4 items-center px-4 py-4 transition-all group"
          >
            <div className="col-span-1">
              <span className="font-mono text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                {rank}
              </span>
            </div>
            <div className="col-span-5 flex items-center gap-3 min-w-0">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-10 w-10 rounded-full ring-1 ring-white/10 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-mono text-sm font-semibold truncate group-hover:text-accent transition-colors">
                  {user.display_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-sm font-semibold text-accent">
                {user.reputation.toLocaleString()}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-sm font-semibold text-neon">
                {formatCurrency(user.total_earned)}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
              <span className="font-mono text-sm font-medium">
                {Math.floor(user.total_earned / 8000)}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </div>
          </Link>
        );
      })}

      {users.length === 0 && (
        <div className="glass rounded-xl p-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No builders yet</p>
        </div>
      )}
    </div>
  );
}

/* ===================== POSTER LEADERBOARD ===================== */

function PosterLeaderboard({ users }: { users: typeof mockUsers }) {
  return (
    <div className="space-y-3">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {users.slice(0, 3).map((user, index) => {
          const rank = index + 1;
          const medal = rankMedals[rank];
          const MedalIcon = medal?.icon || Medal;
          const medalData = medal || rankMedals[3];

          return (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className={cn(
                "glass rounded-xl p-6 text-center transition-all hover:scale-[1.02] border",
                medalData.bg,
                medalData.glow,
                rank === 1 && "sm:order-none order-first sm:-mt-4"
              )}
            >
              <div className="relative inline-block mb-3">
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className={cn(
                    "h-16 w-16 rounded-full ring-2 mx-auto",
                    rank === 1
                      ? "ring-yellow-400/50"
                      : rank === 2
                      ? "ring-gray-300/50"
                      : "ring-amber-600/50"
                  )}
                />
                <div
                  className={cn(
                    "absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold",
                    rank === 1
                      ? "bg-yellow-400 text-black"
                      : rank === 2
                      ? "bg-gray-300 text-black"
                      : "bg-amber-600 text-white"
                  )}
                >
                  {rank}
                </div>
              </div>
              <MedalIcon
                className={cn("h-5 w-5 mx-auto mb-2", medalData.color)}
              />
              <h3 className="font-mono text-sm font-bold mb-0.5">
                {user.display_name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                @{user.username}
              </p>
              <div className="space-y-1.5">
                <div className="font-mono text-sm font-semibold text-neon">
                  {formatCurrency(user.total_posted)}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  total invested
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Poster</div>
        <div className="col-span-2 text-right">Bounties</div>
        <div className="col-span-2 text-right">Total Spent</div>
        <div className="col-span-2 text-right">Reputation</div>
      </div>

      {/* Remaining Rows */}
      {users.slice(3).map((user, index) => {
        const rank = index + 4;
        return (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="glass glass-hover rounded-xl grid grid-cols-12 gap-4 items-center px-4 py-4 transition-all group"
          >
            <div className="col-span-1">
              <span className="font-mono text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                {rank}
              </span>
            </div>
            <div className="col-span-5 flex items-center gap-3 min-w-0">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-10 w-10 rounded-full ring-1 ring-white/10 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-mono text-sm font-semibold truncate group-hover:text-accent transition-colors">
                  {user.display_name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-sm font-medium">
                {Math.ceil(user.total_posted / 3000)}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <span className="font-mono text-sm font-semibold text-neon">
                {formatCurrency(user.total_posted)}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              <Star className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono text-sm font-medium">
                {user.reputation.toLocaleString()}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </div>
          </Link>
        );
      })}

      {users.length === 0 && (
        <div className="glass rounded-xl p-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No posters yet</p>
        </div>
      )}
    </div>
  );
}
