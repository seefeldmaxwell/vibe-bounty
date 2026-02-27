import SubmissionDetailClient from "./submission-detail-client";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubmissionDetailClient id={id} />;
}
