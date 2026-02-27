import Link from "next/link";
import {
  Zap,
  Code2,
  Trophy,
  ArrowRight,
  DollarSign,
  Users,
  Target,
  Sparkles,
} from "lucide-react";
import { BountyCard } from "@/components/bounty-card";
import { mockBounties, mockStats } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const featuredBounties = mockBounties.filter((b) => b.status === "open").slice(0, 3);

  return (
    <div className="relative">
      {/* Background grid effect */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-neon/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-mono">The future of freelance is vibes</span>
          </div>

          <h1 className="font-mono text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
            <span className="text-foreground">Ship Code.</span>
            <br />
            <span className="gradient-text">Get Paid.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted leading-relaxed mb-10">
            Post bounties for the software you need. Builders compete to ship the best
            solution. Every submission gets a live preview. Award the winner and ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white hover:bg-accent-hover transition-all glow-accent hover:scale-105"
            >
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/bounties"
              className="inline-flex items-center gap-2 rounded-xl border border-border-bright px-8 py-3.5 text-base font-semibold text-foreground hover:bg-white/5 transition-all"
            >
              Browse Bounties
            </Link>
          </div>

          {/* Terminal preview */}
          <div className="mt-16 mx-auto max-w-2xl">
            <div className="glass rounded-xl overflow-hidden glow-accent">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  ~/vibe-bounty
                </span>
              </div>
              <div className="px-5 py-4 font-mono text-sm text-left space-y-2">
                <div>
                  <span className="text-neon">$</span>{" "}
                  <span className="text-muted">vibe submit --bounty ai-landing-page</span>
                </div>
                <div className="text-muted-foreground">
                  Uploading bundle... <span className="text-neon">done</span>
                </div>
                <div className="text-muted-foreground">
                  Deploying to preview... <span className="text-neon">done</span>
                </div>
                <div className="text-muted-foreground">
                  Preview live at{" "}
                  <span className="text-accent">
                    https://s7x2k.submissions.vibe-bounty.dev
                  </span>
                </div>
                <div className="mt-2 text-neon">
                  ✓ Submission #42 created. Waiting for review...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                label: "Total Bounties",
                value: mockStats.total_bounties.toLocaleString(),
                icon: Target,
              },
              {
                label: "Paid Out",
                value: formatCurrency(mockStats.total_paid_out),
                icon: DollarSign,
                glow: true,
              },
              {
                label: "Active Builders",
                value: mockStats.active_builders.toLocaleString(),
                icon: Users,
              },
              {
                label: "Open Bounties",
                value: mockStats.open_bounties.toString(),
                icon: Zap,
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 mb-3">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
                <div
                  className={`font-mono text-2xl sm:text-3xl font-bold ${
                    stat.glow ? "text-neon text-glow-neon" : "text-foreground"
                  }`}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="text-accent">Works</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Three steps to turning ideas into shipped code
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Target,
                title: "Post a Bounty",
                description:
                  "Describe what you need with a brief and budget. Set a deadline and let builders compete.",
                color: "text-accent",
                bg: "bg-accent/10",
                border: "border-accent/20",
              },
              {
                step: "02",
                icon: Code2,
                title: "Builders Ship",
                description:
                  "Developers submit their solutions. Each one auto-deploys to a live preview URL you can test.",
                color: "text-neon",
                bg: "bg-neon/10",
                border: "border-neon/20",
              },
              {
                step: "03",
                icon: Trophy,
                title: "Award & Pay",
                description:
                  "Review submissions with live previews, score them, and award the bounty to the best builder.",
                color: "text-warning",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/20",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`glass rounded-xl p-6 border ${item.border} hover:glow-accent transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}
                  >
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="font-mono text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bounties */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 bg-surface">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-mono text-3xl sm:text-4xl font-bold mb-2">
                Featured <span className="text-neon">Bounties</span>
              </h2>
              <p className="text-muted">Jump in and start building today</p>
            </div>
            <Link
              href="/bounties"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-mono"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/bounties"
              className="inline-flex items-center gap-1 text-sm text-accent font-mono"
            >
              View all bounties <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass rounded-2xl p-10 sm:p-16 glow-accent">
            <h2 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">ship</span>?
            </h2>
            <p className="text-muted max-w-md mx-auto mb-8">
              Join thousands of builders earning money doing what they love — writing
              great code.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white hover:bg-accent-hover transition-all hover:scale-105"
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors font-mono"
              >
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
