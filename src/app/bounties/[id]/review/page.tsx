import ReviewPortalClient from "./review-client";

export default async function ReviewPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewPortalClient id={id} />;
}
