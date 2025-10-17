import type { Metadata } from "next";
import { TestDemoProvider } from "@/components/TestDemoProvider";

export const metadata: Metadata = {
  title: "Examples - QueryBox",
  description:
    "See QueryBox in action with live examples from real websites. Explore different implementations of search and AI chat powered by Elasticsearch.",
  keywords: [
    "querybox examples",
    "live demos",
    "website search examples",
    "ai chat examples",
    "elasticsearch examples",
    "querybox integrations",
  ],
  openGraph: {
    title: "Examples - QueryBox",
    description:
      "See QueryBox in action with live examples from real websites. Try interactive demos of search and AI chat.",
    type: "website",
    url: "/examples",
    images: { url: "/og-image.jpg", alt: "QueryBox Examples" },
  },
  twitter: {
    card: "summary_large_image",
    title: "Examples - QueryBox",
    description:
      "See QueryBox in action with live examples from real websites.",
  },
};

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TestDemoProvider>{children}</TestDemoProvider>;
}
