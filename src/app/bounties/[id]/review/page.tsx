import { mockBounties } from "@/lib/mock-data";
import ReviewPortalClient from "./review-client";

export function generateStaticParams() {
  return mockBounties.map((b) => ({ id: b.id }));
}

export default async function ReviewPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewPortalClient id={id} />;
}
