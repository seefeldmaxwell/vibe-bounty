"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Tag,
  Cpu,
  Eye,
  EyeOff,
  Users,
  FileText,
  Sparkles,
  Send,
} from "lucide-react";
import { cn, CATEGORIES, DIFFICULTIES, formatCurrency } from "@/lib/utils";
import { CategoryBadge, DifficultyBadge } from "@/components/badges";

export default function NewBountyPage() {
  const [form, setForm] = useState({
    title: "",
    brief: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    category: "",
    difficulty: "",
    tags: "",
    techStack: "",
    visibility: true,
    maxSubmissions: "10",
  });

  const updateField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const parsedTags = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const parsedTech = form.techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/bounties"
              className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-mono text-foreground">
                Create Bounty
              </h1>
              <p className="text-sm text-muted-foreground">
                Define your project and set the reward
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-6"
            >
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80 font-mono">
                  Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Build a real-time dashboard with WebSockets"
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Brief */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80 font-mono">
                  Brief
                </label>
                <textarea
                  value={form.brief}
                  onChange={(e) => updateField("brief", e.target.value)}
                  placeholder="Describe the project requirements, expected deliverables, design preferences, and any technical constraints..."
                  rows={6}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm resize-none"
                />
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 font-mono">
                    Budget Min ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon" />
                    <input
                      type="number"
                      value={form.budgetMin}
                      onChange={(e) => updateField("budgetMin", e.target.value)}
                      placeholder="500"
                      className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 font-mono">
                    Budget Max ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon" />
                    <input
                      type="number"
                      value={form.budgetMax}
                      onChange={(e) => updateField("budgetMax", e.target.value)}
                      placeholder="2000"
                      className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80 font-mono">
                  Deadline
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Category & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 font-mono">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-card">
                      Select category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-card">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 font-mono">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => updateField("difficulty", e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-card">
                      Select difficulty
                    </option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value} className="bg-card">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80 font-mono">
                  Tags
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    placeholder="dashboard, real-time, analytics"
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Separate with commas
                </p>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80 font-mono">
                  Tech Stack
                </label>
                <div className="relative">
                  <Cpu className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.techStack}
                    onChange={(e) => updateField("techStack", e.target.value)}
                    placeholder="React, Node.js, WebSocket, PostgreSQL"
                    className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Separate with commas
                </p>
              </div>

              {/* Visibility & Max Submissions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 font-mono">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("visibility", !form.visibility)
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
                      form.visibility
                        ? "bg-neon/10 border-neon/30 text-neon"
                        : "bg-card border-border text-muted-foreground"
                    )}
                  >
                    {form.visibility ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                    <span className="text-sm font-mono">
                      {form.visibility ? "Public" : "Private"}
                    </span>
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80 font-mono">
                    Max Submissions
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={form.maxSubmissions}
                      onChange={(e) =>
                        updateField("maxSubmissions", e.target.value)
                      }
                      min="1"
                      max="100"
                      className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] glow-accent font-mono flex items-center justify-center gap-2 text-lg"
              >
                <Send className="w-5 h-5" />
                Publish Bounty
              </button>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-mono font-semibold text-foreground/80">
                  Live Preview
                </h3>
              </div>

              <div className="glass rounded-2xl border border-border overflow-hidden">
                {/* Preview Card */}
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <h3 className="text-lg font-bold font-mono text-foreground leading-tight">
                    {form.title || (
                      <span className="text-muted-foreground/40">
                        Your bounty title...
                      </span>
                    )}
                  </h3>

                  {/* Brief */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {form.brief || "Your bounty description will appear here..."}
                  </p>

                  {/* Budget */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neon" />
                    <span className="text-neon font-mono font-bold">
                      {form.budgetMin && form.budgetMax
                        ? `${formatCurrency(Number(form.budgetMin))} - ${formatCurrency(Number(form.budgetMax))}`
                        : form.budgetMin
                          ? formatCurrency(Number(form.budgetMin))
                          : form.budgetMax
                            ? `Up to ${formatCurrency(Number(form.budgetMax))}`
                            : "$0 - $0"}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {form.category && (
                      <CategoryBadge category={form.category} />
                    )}
                    {form.difficulty && (
                      <DifficultyBadge difficulty={form.difficulty} />
                    )}
                  </div>

                  {/* Tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {parsedTags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs font-mono bg-surface border border-border rounded-md text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tech Stack */}
                  {parsedTech.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground font-mono mb-2">
                        Tech Stack
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedTech.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-xs font-mono bg-accent/10 border border-accent/20 rounded-md text-accent"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-mono">
                        {form.deadline || "No deadline set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-mono">
                        Max {form.maxSubmissions || "10"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/10">
                <h4 className="text-sm font-mono font-semibold text-accent mb-2">
                  Tips for great bounties
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>- Be specific about deliverables</li>
                  <li>- Include design references or mockups</li>
                  <li>- Set a realistic budget and timeline</li>
                  <li>- Define clear acceptance criteria</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
