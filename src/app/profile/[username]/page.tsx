import type { Metadata } from "next";
import ProfileClient from "./profile-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://vibe-bounty-api.seefeldmaxwell1.workers.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/users/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: `@${username} — VibeBounty` };
    const user = await res.json();
    return {
      title: `${user.display_name || user.username} — VibeBounty`,
      description: user.bio?.slice(0, 160) || `Profile of @${username} on VibeBounty`,
    };
  } catch {
    return { title: `@${username} — VibeBounty` };
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileClient username={username} />;
}
