import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Bounties — VibeBounty",
  description: "Find open bounties, filter by category and difficulty, and start building.",
};

export default function BountiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
