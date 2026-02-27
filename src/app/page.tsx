"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, Code2, Trophy, ArrowRight, DollarSign, Users, Target, Sparkles,
  Terminal, Shield, Clock, Star,
} from "lucide-react";
import { BountyCard } from "@/components/bounty-card";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Bounty, PlatformStats } from "@/lib/types";

function parseTags(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
  return [];
}

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) { setCount(target); return; }
    let raf: number;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

/* ─── Typing animation component ─── */
function TerminalTyping() {
  const lines = [
    { prefix: "$ ", text: "vibe submit --bounty ai-landing-page", delay: 0 },
    { prefix: "", text: "Uploading bundle... done", delay: 1200 },
    { prefix: "", text: "Deploying to preview... done", delay: 2000 },
    { prefix: "", text: "Preview live at https://s7x2k.vibe-bounty.dev", delay: 2800 },
    { prefix: "", text: "✓ Submission #42 created. Waiting for review...", delay: 3600 },
  ];

  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = lines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="px-5 py-4 font-mono text-sm text-left space-y-2">
      {lines.slice(0, visibleLines).map((line, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDuration: "0.3s" }}>
          {line.prefix && <span className="text-neon">{line.prefix}</span>}
          <span className={i === 0 ? "text-muted" : i === lines.length - 1 ? "text-neon" : "text-muted-foreground"}>
            {line.text.includes("done") ? (
              <>{line.text.replace("done", "")}<span className="text-neon">done</span></>
            ) : line.text.includes("https://") ? (
              <>{line.text.split("https://")[0]}<span className="text-accent">https://{line.text.split("https://")[1]}</span></>
            ) : (
              line.text
            )}
          </span>
        </div>
      ))}
      {visibleLines < lines.length && (
        <div className="flex items-center gap-1">
          <span className="text-neon">$</span>
          <span className="w-2 h-4 bg-accent animate-pulse" />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [featuredBounties, setFeaturedBounties] = useState<Bounty[]>([]);
  const [bountiesLoading, setBountiesLoading] = useState(true);
  const [bountiesError, setBountiesError] = useState(false);

  useEffect(() => {
    api.stats()
      .then((data) => { setStats(data); setStatsLoading(false); })
      .catch(() => { setStatsError(true); setStatsLoading(false); });

    api.bounties.list({ status: "open" })
      .then((data) => {
        setFeaturedBounties(data.slice(0, 3).map((b: any) => ({
          ...b, tags: parseTags(b.tags), tech_stack: parseTags(b.tech_stack),
        })));
        setBountiesLoading(false);
      })
      .catch(() => { setBountiesError(true); setBountiesLoading(false); });
  }, []);

  const totalBounties = useCountUp(stats?.total_bounties ?? 0, 1200, !!stats);
  const paidOut = useCountUp(stats?.total_paid_out ?? 0, 1500, !!stats);
  const activeBuilders = useCountUp(stats?.active_builders ?? 0, 1000, !!stats);
  const openBounties = useCountUp(stats?.open_bounties ?? 0, 800, !!stats);

  return (
    <div className="relative">
      {/* ─── Ambient Background ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-neon/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      {/* ─── Hero ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm text-accent animate-fade-in-down">
            <div className="relative">
              <Sparkles className="h-3.5 w-3.5" />
              <div className="absolute inset-0 animate-pulse-ring">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </div>
            </div>
            <span className="font-mono">The future of freelance is vibes</span>
          </div>

          <h1 className="font-mono text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 animate-fade-in-up">
            <span className="text-foreground">Ship Code.</span>
            <br />
            <span className="gradient-text">Get Paid.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            Post bounties for the software you need. Builders compete to ship the best
            solution. Every submission gets a live preview. Award the winner and ship.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white hover:bg-accent-hover transition-all glow-accent hover:glow-accent-strong hover:scale-105 active:scale-100">
              Start Building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/bounties" className="inline-flex items-center gap-2 rounded-xl border border-border-bright px-8 py-3.5 text-base font-semibold text-foreground hover:bg-white/5 hover:border-accent/30 transition-all">
              Browse Bounties
            </Link>
          </div>

          {/* Terminal Preview */}
          <div className="mt-16 mx-auto max-w-2xl animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <div className="glass rounded-xl overflow-hidden glow-accent card-hover">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="h-3 w-3 rounded-full bg-danger/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-neon/60" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">~/vibe-bounty</span>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground/50 font-mono">
                  <Terminal className="w-3 h-3" /> zsh
                </div>
              </div>
              <TerminalTyping />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center animate-fade-in-up">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 mb-3">
                    <div className="h-5 w-5 rounded bg-white/10 animate-pulse" />
                  </div>
                  <div className="h-8 w-20 mx-auto rounded bg-white/10 animate-pulse mb-1" />
                  <div className="h-3 w-24 mx-auto rounded bg-white/5 animate-pulse mt-1" />
                </div>
              ))
            ) : statsError ? (
              <div className="col-span-full text-center text-muted-foreground text-sm font-mono py-4">
                Unable to load stats right now.
              </div>
            ) : stats ? (
              [
                { label: "Total Bounties", value: totalBounties.toLocaleString(), icon: Target },
                { label: "Paid Out", value: formatCurrency(paidOut), icon: DollarSign, glow: true },
                { label: "Active Builders", value: activeBuilders.toLocaleString(), icon: Users },
                { label: "Open Bounties", value: openBounties.toString(), icon: Zap },
              ].map((stat) => (
                <div key={stat.label} className="text-center group animate-fade-in-up">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 mb-3 group-hover:bg-accent/10 transition-colors">
                    <stat.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums ${stat.glow ? "text-neon text-glow-neon" : "text-foreground"}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
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

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {[
              {
                step: "01", icon: Target, title: "Post a Bounty",
                description: "Describe what you need with a brief and budget. Set a deadline and let builders compete.",
                color: "text-accent", bg: "bg-accent/10", border: "border-accent/20",
                glowColor: "rgba(139, 92, 246, 0.1)",
              },
              {
                step: "02", icon: Code2, title: "Builders Ship",
                description: "Developers submit their solutions. Each one auto-deploys to a live preview URL you can test.",
                color: "text-neon", bg: "bg-neon/10", border: "border-neon/20",
                glowColor: "rgba(34, 197, 94, 0.1)",
              },
              {
                step: "03", icon: Trophy, title: "Award & Pay",
                description: "Review submissions with live previews, score them, and award the bounty to the best builder.",
                color: "text-warning", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
                glowColor: "rgba(245, 158, 11, 0.1)",
              },
            ].map((item) => (
              <div key={item.step} className={`glass rounded-xl p-6 border ${item.border} card-hover animate-fade-in-up`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">STEP {item.step}</span>
                </div>
                <h3 className="font-mono text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 border-y border-border bg-surface/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
            {[
              { icon: Shield, label: "Escrow Payments", desc: "Funds held securely" },
              { icon: Clock, label: "Fast Payouts", desc: "Paid on award" },
              { icon: Star, label: "Reputation System", desc: "Build your track record" },
              { icon: Users, label: "Growing Community", desc: "Join top builders" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 animate-fade-in-up">
                <div className="h-9 w-9 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-mono font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Bounties ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-mono text-3xl sm:text-4xl font-bold mb-2">
                Featured <span className="text-neon">Bounties</span>
              </h2>
              <p className="text-muted">Jump in and start building today</p>
            </div>
            <Link href="/bounties" className="hidden sm:inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-mono group">
              View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {bountiesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-5 h-full flex flex-col animate-pulse">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-20 rounded bg-white/10" />
                      <div className="h-5 w-16 rounded bg-white/10" />
                    </div>
                    <div className="h-5 w-14 rounded bg-white/10" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-white/10 mb-2" />
                  <div className="h-4 w-full rounded bg-white/5 mb-1" />
                  <div className="h-4 w-2/3 rounded bg-white/5 mb-4" />
                  <div className="h-6 w-32 rounded bg-white/10 mb-4" />
                  <div className="flex gap-1.5 mb-4">
                    <div className="h-5 w-12 rounded bg-white/5" />
                    <div className="h-5 w-14 rounded bg-white/5" />
                    <div className="h-5 w-10 rounded bg-white/5" />
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between">
                    <div className="h-3 w-16 rounded bg-white/5" />
                    <div className="h-3 w-20 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : bountiesError ? (
            <div className="text-center text-muted-foreground text-sm font-mono py-12">
              Unable to load bounties right now. Please try again later.
            </div>
          ) : featuredBounties.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm font-mono py-12">
              No open bounties at the moment. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {featuredBounties.map((bounty) => (
                <div key={bounty.id} className="animate-fade-in-up">
                  <BountyCard bounty={bounty} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/bounties" className="inline-flex items-center gap-1 text-sm text-accent font-mono">
              View all bounties <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass rounded-2xl p-10 sm:p-16 glow-accent-strong relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-neon/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative">
              <h2 className="font-mono text-3xl sm:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">ship</span>?
              </h2>
              <p className="text-muted max-w-md mx-auto mb-8">
                Join thousands of builders earning money doing what they love — writing great code.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white hover:bg-accent-hover transition-all hover:scale-105 active:scale-100">
                  Create Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors font-mono">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
