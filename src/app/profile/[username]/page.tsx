import { mockUsers } from "@/lib/mock-data";
import ProfileClient from "./profile-client";

export function generateStaticParams() {
  return mockUsers.map((u) => ({ username: u.username }));
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileClient username={username} />;
}
