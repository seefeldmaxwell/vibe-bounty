import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In — VibeBounty",
  description: "Sign in to your VibeBounty account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
