import type { Metadata } from "next";
import BountyDetailClient from "./bounty-detail-client";

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
    const res = await fetch(`${API_BASE}/api/bounties/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Bounty — VibeBounty" };
    const bounty = await res.json();
    return {
      title: `${bounty.title} — VibeBounty`,
      description: bounty.brief?.slice(0, 160),
    };
  } catch {
    return { title: "Bounty — VibeBounty" };
  }
}

export default async function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BountyDetailClient id={id} />;
}
