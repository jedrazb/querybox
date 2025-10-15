import type { Metadata } from "next";
import { TestDemoProvider } from "@/components/TestDemoProvider";

export const metadata: Metadata = {
  title: "Get Started - QueryBox",
  description:
    "Set up QueryBox for your website in 3 simple steps: add your domain, crawl your content, and integrate the search and AI chat widget. Get started in minutes.",
  keywords: [
    "querybox setup",
    "get started",
    "website search setup",
    "ai chat installation",
    "elasticsearch integration",
    "website crawler",
  ],
  openGraph: {
    title: "Get Started - QueryBox",
    description:
      "Set up QueryBox for your website in 3 simple steps: add your domain, crawl your content, and integrate the search and AI chat widget.",
    type: "website",
    url: "/get-started",
    images: { url: "/og-image.jpg", alt: "Get Started with QueryBox" },
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Started - QueryBox",
    description:
      "Set up search and AI chat for your website in 3 simple steps.",
  },
};

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TestDemoProvider>{children}</TestDemoProvider>;
}
