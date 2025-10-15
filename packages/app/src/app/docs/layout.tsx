import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - QueryBox",
  description:
    "Complete documentation for QueryBox - learn how to install, configure, and use the embeddable search and AI chat widget powered by Elasticsearch.",
  keywords: [
    "querybox documentation",
    "search widget docs",
    "ai chat widget",
    "elasticsearch search",
    "querybox api",
    "installation guide",
  ],
  openGraph: {
    title: "Documentation - QueryBox",
    description:
      "Complete documentation for QueryBox - learn how to install, configure, and use the embeddable search and AI chat widget powered by Elasticsearch.",
    type: "article",
    url: "/docs",
    images: { url: "/og-image.jpg", alt: "QueryBox Documentation" },
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation - QueryBox",
    description:
      "Complete documentation for QueryBox - installation, configuration, and API reference.",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
