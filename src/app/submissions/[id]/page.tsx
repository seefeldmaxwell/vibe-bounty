import { mockSubmissions } from "@/lib/mock-data";
import SubmissionDetailClient from "./submission-detail-client";

export function generateStaticParams() {
  return mockSubmissions.map((s) => ({ id: s.id }));
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubmissionDetailClient id={id} />;
}
