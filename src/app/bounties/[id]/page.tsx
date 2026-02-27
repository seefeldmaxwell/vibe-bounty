import BountyDetailClient from "./bounty-detail-client";

export default async function BountyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BountyDetailClient id={id} />;
}
