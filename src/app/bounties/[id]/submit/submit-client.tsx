"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Upload, Github, FileText, Tag, DollarSign, Send, FileUp, X, Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/toast";

export default function SubmitToBountyClient({ id }: { id: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bounty, setBounty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", repoUrl: "", techUsed: "" });
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    api.bounties.get(id)
      .then(setBounty)
      .catch(() => toast("Failed to load bounty", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const parsedTech = form.techUsed.split(",").map((t) => t.trim()).filter(Boolean);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast("Please add a title", "error"); return; }
    if (!form.description) { toast("Please add a description", "error"); return; }

    setSubmitting(true);
    try {
      const submission = await api.submissions.create({
        bounty_id: id,
        title: form.title,
        description: form.description,
        repo_url: form.repoUrl || undefined,
        tech_used: parsedTech,
      });

      if (files.length > 0 && submission?.id) {
        try {
          await api.upload(submission.id, files);
        } catch {
          toast("Submission created but file upload failed", "error");
        }
      }

      toast("Submission created successfully!", "success");
      router.push(`/bounties/${id}`);
    } catch (err: any) {
      toast(err.message || "Failed to submit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="px-4 py-32 text-center">
        <h1 className="font-mono text-2xl font-bold mb-2">Bounty not found</h1>
        <Link href="/bounties" className="text-accent hover:underline text-sm font-mono">Back to bounties</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/bounties/${bounty.id}`} className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-mono text-foreground">Submit to Bounty</h1>
              <p className="text-sm text-muted-foreground">Show what you&apos;ve built</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-xl border border-border p-5 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-mono text-muted-foreground mb-1">Submitting to</p>
              <h2 className="text-lg font-bold font-mono text-foreground truncate">{bounty.title}</h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bounty.brief}</p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-neon font-mono font-bold text-lg">
              <DollarSign className="w-5 h-5" />
              {formatCurrency(bounty.budget_max)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80 font-mono">Submission Title</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="My awesome implementation" className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80 font-mono">Description</label>
            <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your approach, key decisions, features implemented..." rows={8} className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm resize-none" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80 font-mono">
              GitHub Repo URL <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="url" value={form.repoUrl} onChange={(e) => updateField("repoUrl", e.target.value)} placeholder="https://github.com/you/your-repo" className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80 font-mono">Attachments</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className={cn(
                "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
                dragActive ? "border-accent bg-accent/5" : "border-border hover:border-border-bright bg-card"
              )}
            >
              <input id="file-input" type="file" multiple onChange={handleFileInput} className="hidden" />
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors", dragActive ? "bg-accent/20 text-accent" : "bg-surface text-muted-foreground")}>
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Drag & drop files here</p>
                <p className="text-xs text-muted-foreground">or click to browse - ZIP, images, videos up to 50MB</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-lg">
                    <FileUp className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-sm font-mono text-foreground truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)}KB</span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-surface text-muted-foreground hover:text-danger transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground/80 font-mono">Tech Used</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={form.techUsed} onChange={(e) => updateField("techUsed", e.target.value)} placeholder="React, TypeScript, Tailwind CSS" className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-colors text-sm" />
            </div>
            <p className="text-xs text-muted-foreground">Separate with commas</p>
            {parsedTech.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parsedTech.map((tech, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-mono bg-accent/10 border border-accent/20 rounded-md text-accent">{tech}</span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] glow-accent font-mono flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {submitting ? "Submitting..." : "Submit Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
