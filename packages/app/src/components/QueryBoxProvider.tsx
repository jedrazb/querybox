"use client";

import { extractBaseDomain } from "@/lib/utils";
import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";

// We'll dynamically import QueryBox to avoid SSR issues
let QueryBox: any = null;

interface QueryBoxContextType {
  search: () => void;
  chat: () => void;
  instance: any;
}

const QueryBoxContext = createContext<QueryBoxContextType | null>(null);

export function QueryBoxProvider({ children }: { children: ReactNode }) {
  const queryboxRef = useRef<any>(null);
  const pathname = usePathname();

  // Load QueryBox dynamically
  useEffect(() => {
    // Don't initialize on get-started page - it has its own TestDemoProvider
    if (pathname === "/get-started") {
      return;
    }

    const loadQueryBox = async () => {
      if (typeof window !== "undefined" && !QueryBox) {
        try {
          // Dynamically import the module
          const module = await import("@jedrazb/querybox");
          QueryBox = module.default;

          // Use environment variable for API URL, fallback to production
          const publicUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const processedDomain = extractBaseDomain(publicUrl);

          // Initialize with demo endpoint
          queryboxRef.current = new QueryBox({
            apiEndpoint: `/api/querybox/${processedDomain}/v1`,
            primaryColor: "#FF10D3",
          });
        } catch (error) {
          console.error("❌ Failed to load QueryBox:", error);
        }
      }
    };

    loadQueryBox();

    // Add keyboard shortcut for Cmd+K / Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        console.log("⌨️  Cmd+K pressed, opening search...");
        queryboxRef.current?.search();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (queryboxRef.current) {
        queryboxRef.current.destroy();
      }
    };
  }, [pathname]);

  const value: QueryBoxContextType = {
    search: () => {
      console.log("🔍 Opening search...");
      queryboxRef.current?.search();
    },
    chat: () => {
      console.log("💬 Opening chat...");
      queryboxRef.current?.chat();
    },
    instance: queryboxRef.current,
  };

  return (
    <QueryBoxContext.Provider value={value}>
      {children}
    </QueryBoxContext.Provider>
  );
}

export function useQueryBox() {
  const context = useContext(QueryBoxContext);
  if (!context) {
    throw new Error("useQueryBox must be used within QueryBoxProvider");
  }
  return context;
}
