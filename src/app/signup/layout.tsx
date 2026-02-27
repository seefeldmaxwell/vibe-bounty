import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — VibeBounty",
  description: "Create your VibeBounty account and start building or posting bounties.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
