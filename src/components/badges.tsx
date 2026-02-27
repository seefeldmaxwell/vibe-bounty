import { cn } from "@/lib/utils";

const categoryStyles: Record<string, string> = {
  "landing-page": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "web-app": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "mobile-app": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  api: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "cli-tool": "bg-green-500/10 text-green-400 border-green-500/20",
  game: "bg-red-500/10 text-red-400 border-red-500/20",
  "chrome-ext": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const categoryLabels: Record<string, string> = {
  "landing-page": "Landing Page",
  "web-app": "Web App",
  "mobile-app": "Mobile App",
  api: "API",
  "cli-tool": "CLI Tool",
  game: "Game",
  "chrome-ext": "Chrome Ext",
  other: "Other",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        categoryStyles[category] || categoryStyles.other
      )}
    >
      {categoryLabels[category] || category}
    </span>
  );
}

const difficultyStyles: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  advanced: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  expert: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        difficultyStyles[difficulty] || difficultyStyles.beginner
      )}
    >
      {difficulty}
    </span>
  );
}

const statusStyles: Record<string, string> = {
  open: "bg-neon/10 text-neon border-neon/20",
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  in_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  awarded: "bg-accent/10 text-accent border-accent/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  draft: "Draft",
  in_review: "In Review",
  awarded: "Awarded",
  cancelled: "Cancelled",
  expired: "Expired",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        statusStyles[status] || statusStyles.open
      )}
    >
      {status === "open" && (
        <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-dot" />
      )}
      {statusLabels[status] || status}
    </span>
  );
}

const submissionStatusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  deploying: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  live: "bg-neon/10 text-neon border-neon/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  withdrawn: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  winner: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function SubmissionStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        submissionStatusStyles[status] || submissionStatusStyles.pending
      )}
    >
      {status === "live" && (
        <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse-dot" />
      )}
      {status === "winner" && "🏆 "}
      {status}
    </span>
  );
}
