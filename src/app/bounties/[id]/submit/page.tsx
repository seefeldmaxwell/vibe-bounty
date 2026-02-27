import { mockBounties } from "@/lib/mock-data";
import SubmitToBountyClient from "./submit-client";

export function generateStaticParams() {
  return mockBounties.map((b) => ({ id: b.id }));
}

export default async function SubmitToBountyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubmitToBountyClient id={id} />;
}
