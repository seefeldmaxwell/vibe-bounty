import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — VibeBounty",
  description: "Manage your bounties, submissions, and track your progress.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
