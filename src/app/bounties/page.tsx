"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { BountyCard } from "@/components/bounty-card";
import { api } from "@/lib/api";
import { CATEGORIES, DIFFICULTIES, cn } from "@/lib/utils";
import { Bounty } from "@/lib/types";

type SortOption = "newest" | "highest" | "deadline" | "submissions";

function parseTags(val: unknown): string[] {
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

function BountyCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 h-full flex flex-col animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded-md bg-white/5" />
          <div className="h-5 w-16 rounded-md bg-white/5" />
        </div>
        <div className="h-5 w-14 rounded-md bg-white/5" />
      </div>
      <div className="h-5 w-3/4 rounded bg-white/5 mb-2" />
      <div className="h-4 w-full rounded bg-white/5 mb-1" />
      <div className="h-4 w-2/3 rounded bg-white/5 mb-4 flex-1" />
      <div className="h-6 w-40 rounded bg-white/5 mb-4" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-12 rounded-md bg-white/5" />
        <div className="h-5 w-16 rounded-md bg-white/5" />
        <div className="h-5 w-10 rounded-md bg-white/5" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-white/5" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function BountiesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch bounties when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchBounties() {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, string> = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;
        if (sort) params.sort = sort;

        const data = await api.bounties.list(
          Object.keys(params).length > 0 ? params : undefined
        );

        if (cancelled) return;

        const parsed = (data ?? []).map((bounty: any) => ({
          ...bounty,
          tags: parseTags(bounty.tags),
          tech_stack: parseTags(bounty.tech_stack),
        }));

        setBounties(parsed);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load bounties");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBounties();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, difficulty, sort, retryCount]);

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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          <div className="glass rounded-xl p-5 mb-6 space-y-4 animate-fade-in-down" style={{ animationDuration: "0.2s" }}>
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

        {/* Error state */}
        {error && (
          <div className="glass rounded-xl p-6 mb-6 border border-danger/30 bg-danger/5">
            <p className="text-danger text-sm font-mono mb-2">
              Failed to load bounties
            </p>
            <p className="text-muted-foreground text-sm mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setRetryCount((c) => c + 1);
              }}
              className="text-xs text-accent hover:underline font-mono"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-muted-foreground font-mono animate-fade-in">
            {bounties.length} {bounties.length === 1 ? "bounty" : "bounties"} found
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BountyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && bounties.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {bounties.map((bounty) => (
              <div key={bounty.id} className="animate-fade-in-up">
                <BountyCard bounty={bounty} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bounties.length === 0 && (
          <div className="glass rounded-2xl p-16 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-lg font-bold text-foreground mb-2">No bounties found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Try adjusting your filters or search terms to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
