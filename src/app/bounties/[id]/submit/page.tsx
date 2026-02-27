import SubmitToBountyClient from "./submit-client";

export default async function SubmitToBountyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubmitToBountyClient id={id} />;
}
