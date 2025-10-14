/**
 * Next.js Example Component
 *
 * This file demonstrates how to use QueryBox in a Next.js application.
 * Place this in your app/components/ or components/ directory.
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface QueryBoxInstance {
  search: () => void;
  chat: () => void;
  destroy: () => void;
  getConfig: () => any;
}

export function QueryBoxWidget() {
  const [querybox, setQuerybox] = useState<QueryBoxInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import QueryBox (client-side only)
    const loadQueryBox = async () => {
      try {
        const { default: QueryBox } = await import("@jedrazb/querybox");
        await import("@jedrazb/querybox/dist/style.css");

        const instance = new QueryBox({
          host: process.env.NEXT_PUBLIC_HOST || "http://localhost:9200",
          apiKey: process.env.NEXT_PUBLIC_API_KEY || "your-api-key",
          agentId: process.env.NEXT_PUBLIC_AGENT_ID || "default-agent",
          theme: "auto",
        });

        setQuerybox(instance);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load QueryBox:", err);
        setError("Failed to load QueryBox widget");
        setIsLoading(false);
      }
    };

    loadQueryBox();

    // Cleanup on unmount
    return () => {
      if (querybox) {
        querybox.destroy();
      }
    };
  }, []);

  if (error) {
    return <div style={{ color: "red", padding: "16px" }}>Error: {error}</div>;
  }

  if (isLoading) {
    return <div style={{ padding: "16px" }}>Loading QueryBox...</div>;
  }

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <button
        onClick={() => querybox?.search()}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          color: "white",
          background: "#667eea",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        🔍 Search
      </button>
      <button
        onClick={() => querybox?.chat()}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          color: "white",
          background: "#764ba2",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        💬 Chat
      </button>
    </div>
  );
}

/**
 * Usage in your Next.js page:
 *
 * import { QueryBoxWidget } from '@/components/QueryBoxWidget';
 *
 * export default function Home() {
 *   return (
 *     <main>
 *       <h1>My App</h1>
 *       <QueryBoxWidget />
 *     </main>
 *   );
 * }
 *
 * Or install directly:
 * npm install @jedrazb/querybox
 */
