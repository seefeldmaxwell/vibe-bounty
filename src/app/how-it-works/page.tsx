"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Code2,
  FileText,
  Search,
  Rocket,
  Trophy,
  DollarSign,
  Star,
  Users,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  CheckCircle2,
  Wallet,
  PenTool,
  Upload,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";

const posterSteps = [
  {
    step: "01",
    title: "Create a Bounty",
    description:
      "Define your project requirements, set your budget range, deadline, and technical specifications. Be as detailed as possible to attract the right builders.",
    icon: <FileText className="w-6 h-6" />,
    color: "accent" as const,
  },
  {
    step: "02",
    title: "Review Submissions",
    description:
      "Watch as talented builders submit their implementations. Each submission includes a live preview, source code, and detailed documentation of their approach.",
    icon: <Eye className="w-6 h-6" />,
    color: "accent" as const,
  },
  {
    step: "03",
    title: "Score & Provide Feedback",
    description:
      "Rate each submission on a 1-10 scale and leave constructive feedback. Help builders improve even if their submission isn't selected.",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "accent" as const,
  },
  {
    step: "04",
    title: "Award the Bounty",
    description:
      "Select the winning submission and release the payment. The builder gets paid, you get your project built. Simple, transparent, and fair.",
    icon: <Trophy className="w-6 h-6" />,
    color: "neon" as const,
  },
];

const builderSteps = [
  {
    step: "01",
    title: "Browse Bounties",
    description:
      "Explore open bounties filtered by category, difficulty, budget, and tech stack. Find projects that match your skills and interests.",
    icon: <Search className="w-6 h-6" />,
    color: "accent" as const,
  },
  {
    step: "02",
    title: "Build & Submit",
    description:
      "Fork the repo or start from scratch. Build your implementation, deploy a live preview, and submit with a detailed description of your approach.",
    icon: <GitBranch className="w-6 h-6" />,
    color: "accent" as const,
  },
  {
    step: "03",
    title: "Get Reviewed",
    description:
      "The poster reviews your work, provides a score, and shares feedback. Use this to improve your craft and build your reputation on the platform.",
    icon: <Star className="w-6 h-6" />,
    color: "accent" as const,
  },
  {
    step: "04",
    title: "Get Paid",
    description:
      "If your submission is selected, the bounty is awarded to you. Payments are processed quickly and securely. Build your portfolio and earnings history.",
    icon: <Wallet className="w-6 h-6" />,
    color: "neon" as const,
  },
];

const faqs = [
  {
    question: "How does payment work?",
    answer:
      "Posters fund the bounty when they create it. The funds are held in escrow until the bounty is awarded. Once awarded, the builder receives the payment minus a small platform fee. We support payouts via Stripe, PayPal, and crypto wallets.",
  },
  {
    question: "What if no submission meets my requirements?",
    answer:
      "If no submission meets your criteria by the deadline, you can extend the deadline, increase the budget, or cancel the bounty and receive a full refund minus processing fees.",
  },
  {
    question: "Can I submit to multiple bounties at once?",
    answer:
      "Absolutely! There's no limit to how many bounties you can work on simultaneously. Many top builders work on several projects at once to maximize their earnings.",
  },
  {
    question: "Is there a platform fee?",
    answer:
      "VibeBounty charges a 5% platform fee on awarded bounties. This covers payment processing, hosting, and platform maintenance. There are no fees for browsing or creating an account.",
  },
  {
    question: "How do I increase my chances of winning?",
    answer:
      "Read the bounty brief carefully, follow all requirements, deploy a working live preview, write clean code, and provide thorough documentation. Builders with strong track records and good ratings tend to win more bounties.",
  },
  {
    question: "Can I collaborate with other builders?",
    answer:
      "Currently, submissions are individual. However, you can form teams outside the platform and submit under one account. We're working on native team support for a future release.",
  },
  {
    question: "What happens to my intellectual property?",
    answer:
      "Upon accepting a bounty award, the IP rights transfer to the poster as specified in the bounty terms. Make sure to review the terms before submitting. You retain the right to showcase the work in your portfolio.",
  },
  {
    question: "How are disputes handled?",
    answer:
      "We have a dedicated dispute resolution team. If a poster and builder disagree on the outcome, either party can open a dispute. Our team reviews the submission against the bounty requirements and makes a fair decision.",
  },
];

const features = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Escrow Protection",
    description: "Funds held securely until work is approved",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Fast Payouts",
    description: "Get paid within 24 hours of award",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Reputation System",
    description: "Build credibility with reviews and ratings",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Global Community",
    description: "Connect with builders and posters worldwide",
  },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-mono mb-6">
              <Rocket className="w-4 h-4" />
              How VibeBounty Works
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-mono leading-tight mb-6">
              <span className="gradient-text">Ship projects.</span>
              <br />
              <span className="text-foreground">Earn bounties.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              VibeBounty connects project owners with talented builders. Post a
              bounty, get submissions, award the best. It&apos;s that simple.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/bounties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-accent font-mono"
              >
                Browse Bounties
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bounties/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-card-hover border border-border text-foreground font-semibold rounded-xl transition-all font-mono"
              >
                Post a Bounty
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y border-border bg-surface/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground font-mono">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Posters */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-3xl font-bold font-mono text-foreground">
              For Posters
            </h2>
          </div>
          <p className="text-muted-foreground mb-12 ml-[52px]">
            Get your project built by the best talent in the community
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posterSteps.map((item) => (
              <div
                key={item.step}
                className="glass glass-hover rounded-2xl border border-border p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      item.color === "neon"
                        ? "bg-neon/10 text-neon border border-neon/20 group-hover:bg-neon/20"
                        : "bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent/20"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-mono font-bold",
                          item.color === "neon"
                            ? "text-neon"
                            : "text-accent"
                        )}
                      >
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-mono text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* For Builders */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-neon/20 border border-neon/30 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-neon" />
            </div>
            <h2 className="text-3xl font-bold font-mono text-foreground">
              For Builders
            </h2>
          </div>
          <p className="text-muted-foreground mb-12 ml-[52px]">
            Turn your skills into income by building real projects
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {builderSteps.map((item) => (
              <div
                key={item.step}
                className="glass glass-hover rounded-2xl border border-border p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      item.color === "neon"
                        ? "bg-neon/10 text-neon border border-neon/20 group-hover:bg-neon/20"
                        : "bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent/20"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-mono font-bold",
                          item.color === "neon"
                            ? "text-neon"
                            : "text-accent"
                        )}
                      >
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-mono text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-mono text-foreground mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about VibeBounty
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  "glass rounded-xl border transition-colors",
                  openFaq === i
                    ? "border-accent/30"
                    : "border-border hover:border-border-bright"
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-foreground font-mono text-sm">
                    {faq.question}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl border border-border p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold font-mono text-foreground mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of builders and posters shipping projects on
                VibeBounty. Your next great build is waiting.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-accent font-mono"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/bounties"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-card hover:bg-card-hover border border-border text-foreground font-semibold rounded-xl transition-all font-mono"
                >
                  Explore Bounties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
