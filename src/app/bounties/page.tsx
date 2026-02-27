"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BountyCard } from "@/components/bounty-card";
import { mockBounties } from "@/lib/mock-data";
import { CATEGORIES, DIFFICULTIES, cn } from "@/lib/utils";

type SortOption = "newest" | "highest" | "deadline" | "submissions";

export default function BountiesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...mockBounties];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.brief.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (category) {
      result = result.filter((b) => b.category === category);
    }

    if (difficulty) {
      result = result.filter((b) => b.difficulty === difficulty);
    }

    switch (sort) {
      case "highest":
        result.sort((a, b) => b.budget_max - a.budget_max);
        break;
      case "deadline":
        result.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      case "submissions":
        result.sort((a, b) => b.submission_count - a.submission_count);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [search, category, difficulty, sort]);

  const activeFilterCount = [category, difficulty].filter(Boolean).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl sm:text-4xl font-bold mb-2">
            Browse <span className="text-accent">Bounties</span>
          </h1>
          <p className="text-muted">
            Find your next project and start earning
          </p>
        </div>

        {/* Search & Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bounties, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Bounty</option>
            <option value="deadline">Deadline</option>
            <option value="submissions">Most Submissions</option>
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors",
              showFilters
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-card text-muted hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panels */}
        {showFilters && (
          <div className="glass rounded-xl p-5 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">Filters</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setCategory("");
                    setDifficulty("");
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() =>
                      setCategory(category === cat.value ? "" : cat.value)
                    }
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors",
                      category === cat.value
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border-bright"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() =>
                      setDifficulty(difficulty === diff.value ? "" : diff.value)
                    }
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors",
                      difficulty === diff.value
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border-bright"
                    )}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground font-mono">
          {filtered.length} bounties found
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-16 text-center">
            <p className="text-muted-foreground mb-2">No bounties found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
