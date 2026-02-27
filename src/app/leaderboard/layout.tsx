import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — VibeBounty",
  description: "Top builders and posters on VibeBounty ranked by reputation and earnings.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
