import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — VibeBounty",
  description: "Manage your profile, payout information, and notification preferences.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
