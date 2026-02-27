"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg animate-fade-in-up">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-danger/10 border border-danger/20 mb-6">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>

        <h1 className="font-mono text-2xl sm:text-3xl font-bold mb-3">
          Something went <span className="text-danger">wrong</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. This has been noted and we&apos;ll look into it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-all hover:scale-105"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border-bright px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
