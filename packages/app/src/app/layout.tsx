import type { Metadata } from "next";
import Header from "@/components/Header";
import { GoogleAnalytics } from "@next/third-parties/google";
import { QueryBoxProvider } from "@/components/QueryBoxProvider";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "QueryBox - Website Search & Chat Widget",
  description:
    "Add powerful search and AI-powered chat to any website. Powered by Elasticsearch.",
  keywords: ["search", "chat", "widget", "elasticsearch", "ai"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL!),
  openGraph: {
    title: "QueryBox - Website Search & Chat Widget",
    description:
      "Add powerful search and AI-powered chat to any website. Powered by Elasticsearch.",
    images: { url: "/og-image.jpg", alt: "QueryBox logo" },
  },
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
          <div style={{ paddingTop: "70px", minHeight: "100vh" }}>
            {children}
          </div>
          <footer className="footer">
            <div className="footerContent">
              <img src="/querybox.svg" alt="QueryBox" className="footerLogo" />
              <p>
                Built with ❤️ by{" "}
                <a
                  href="https://github.com/jedrazb"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  jedrazb
                </a>
              </p>
            </div>
            <div className="footerLinks">
              <a href="/get-started">Get Started</a>
              <a href="/examples">Examples</a>
              <a href="/docs#public-api">Public API</a>
              <a
                href="https://github.com/jedrazb/querybox"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a href="/docs">Docs</a>
              <a href="https://www.npmjs.com/package/@jedrazb/querybox">npm</a>
            </div>
          </footer>
        </QueryBoxProvider>
      </body>
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
      ) : null}
    </html>
  );
}
