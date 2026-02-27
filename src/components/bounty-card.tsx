import Link from "next/link";
import { Clock, Users, ArrowUpRight } from "lucide-react";
import { Bounty } from "@/lib/types";
import { cn, formatCurrency, timeRemaining } from "@/lib/utils";
import { DifficultyBadge, CategoryBadge, StatusBadge } from "./badges";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const deadlineText = bounty.deadline ? timeRemaining(bounty.deadline) : null;
  const isExpired = deadlineText === "Expired";

  return (
    <Link href={`/bounties/${bounty.id}`} className="group block">
      <div className="glass glass-hover rounded-xl p-5 transition-all duration-300 group-hover:glow-accent h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={bounty.category} />
            <DifficultyBadge difficulty={bounty.difficulty} />
          </div>
          <StatusBadge status={bounty.status} />
        </div>

        {/* Title */}
        <h3 className="font-mono text-base font-semibold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2">
          {bounty.title}
        </h3>

        {/* Brief */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {bounty.brief}
        </p>

        {/* Budget */}
        <div className="mb-4">
          <span className="font-mono text-lg font-bold text-neon text-glow-neon">
            {formatCurrency(bounty.budget_min)} — {formatCurrency(bounty.budget_max)}
          </span>
        </div>

        {/* Tags */}
        {bounty.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bounty.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {deadlineText && (
              <span className={cn("flex items-center gap-1", isExpired && "text-danger")}>
                <Clock className="h-3 w-3" />
                {deadlineText}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {bounty.submission_count}/{bounty.max_submissions}
            </span>
          </div>

          {/* Poster avatar */}
          {bounty.poster && (
            <div className="flex items-center gap-2">
              <img
                src={bounty.poster.avatar_url}
                alt={bounty.poster.username}
                className="h-5 w-5 rounded-full bg-border"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {bounty.poster.username}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
