import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Browse Bounties", href: "/bounties" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  Builders: [
    { label: "Get Started", href: "/signup" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Submit Work", href: "/bounties" },
  ],
  Company: [
    { label: "About", href: "/how-it-works" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Twitter", href: "https://twitter.com" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <span className="font-mono text-lg font-bold">
                vibe<span className="text-accent">bounty</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ship code. Get paid. The bug bounty platform for vibe coders.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VibeBounty. Built with vibes.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
