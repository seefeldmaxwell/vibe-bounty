import type { Metadata } from "next";
import SubmissionDetailClient from "./submission-detail-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://vibe-bounty-api.seefeldmaxwell1.workers.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/submissions/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Submission — VibeBounty" };
    const sub = await res.json();
    return {
      title: `${sub.title || "Submission"} — VibeBounty`,
      description: sub.description?.slice(0, 160),
    };
  } catch {
    return { title: "Submission — VibeBounty" };
  }
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubmissionDetailClient id={id} />;
}
