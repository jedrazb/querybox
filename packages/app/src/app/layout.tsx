import type { Metadata } from "next";
import Header from "@/components/Header";
import { QueryBoxProvider } from "@/components/QueryBoxProvider";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "QueryBox - Embeddable Search & AI Chat Widgets",
  description:
    "Add powerful search and AI-powered chat to any website. Powered by Elasticsearch.",
  keywords: ["search", "chat", "widget", "elasticsearch", "ai", "embeddable"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/querybox.css" />
      </head>
      <body>
        <QueryBoxProvider>
          <Header />
          <div style={{ paddingTop: "70px" }}>{children}</div>
        </QueryBoxProvider>
      </body>
    </html>
  );
}
