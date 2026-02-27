import { mockBounties } from "@/lib/mock-data";
import BountyDetailClient from "./bounty-detail-client";

export function generateStaticParams() {
  return mockBounties.map((b) => ({ id: b.id }));
}

export default async function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BountyDetailClient id={id} />;
}
