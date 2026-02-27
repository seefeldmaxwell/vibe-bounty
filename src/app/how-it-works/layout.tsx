import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — VibeBounty",
  description: "Learn how VibeBounty connects project owners with talented builders through bounties.",
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
