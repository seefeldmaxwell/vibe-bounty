import Link from "next/link";
import { Zap, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="relative mb-8 inline-block">
          <div className="text-[10rem] font-mono font-black leading-none text-border-bright select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center glow-accent animate-float">
              <Zap className="h-10 w-10 text-accent" />
            </div>
          </div>
        </div>

        <h1 className="font-mono text-2xl sm:text-3xl font-bold mb-3 animate-fade-in-up">
          Page not <span className="text-accent">found</span>
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Maybe the vibe just wasn&apos;t right.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-all hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
          <Link
            href="/bounties"
            className="inline-flex items-center gap-2 rounded-xl border border-border-bright px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/5 transition-all"
          >
            <Search className="h-4 w-4" />
            Browse Bounties
          </Link>
        </div>
      </div>
    </div>
  );
}
