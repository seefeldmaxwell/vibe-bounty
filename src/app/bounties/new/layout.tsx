import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Bounty — VibeBounty",
  description: "Create a new bounty and find talented builders to bring your project to life.",
};

export default function NewBountyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
