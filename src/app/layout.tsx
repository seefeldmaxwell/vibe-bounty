import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeBounty — Ship Code. Get Paid.",
  description:
    "The bug bounty platform for vibe coders. Post bounties, build solutions, earn rewards.",
  keywords: ["bug bounty", "vibe coding", "freelance", "code bounty", "developer"],
  openGraph: {
    title: "VibeBounty — Ship Code. Get Paid.",
    description: "The bug bounty platform for vibe coders. Post bounties, build solutions, earn rewards.",
    type: "website",
    url: "https://vibe-bounty-web.seefeldmaxwell1.workers.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeBounty — Ship Code. Get Paid.",
    description: "The bug bounty platform for vibe coders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
