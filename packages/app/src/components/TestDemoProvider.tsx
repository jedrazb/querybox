"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";

// Dynamically import QueryBox to avoid SSR issues
let QueryBox: any = null;

interface TestDemoContextType {
  search: () => void;
  chat: () => void;
  initializeForDomain: (domain: string) => Promise<void>;
  isReady: boolean;
}

const TestDemoContext = createContext<TestDemoContextType | null>(null);

export function TestDemoProvider({ children }: { children: ReactNode }) {
  const queryboxRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Load QueryBox module once on mount
  useEffect(() => {
    const loadQueryBoxModule = async () => {
      if (typeof window !== "undefined" && !QueryBox) {
        try {
          const module = await import("@jedrazb/querybox");
          QueryBox = module.default;
          console.log("✅ QueryBox module loaded");
        } catch (error) {
          console.error("❌ Failed to load QueryBox module:", error);
        }
      }
    };

    loadQueryBoxModule();

    return () => {
      if (queryboxRef.current) {
        queryboxRef.current.destroy();
        queryboxRef.current = null;
      }
    };
  }, []);

  const initializeForDomain = async (domain: string) => {
    if (!QueryBox) {
      console.error("QueryBox module not loaded yet");
      return;
    }

    // Destroy existing instance if any
    if (queryboxRef.current) {
      queryboxRef.current.destroy();
      queryboxRef.current = null;
      setIsReady(false);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Initialize with custom domain and pink theme
      queryboxRef.current = new QueryBox({
        apiEndpoint: `${apiUrl}/api/querybox/${domain}/v1`,
        primaryColor: "#ec4899", // Pink color for demo
      });

      setIsReady(true);
      console.log(
        "✅ QueryBox initialized for domain:",
        domain,
        "with pink theme"
      );
    } catch (error) {
      console.error("❌ Failed to initialize QueryBox:", error);
      setIsReady(false);
    }
  };

  const value: TestDemoContextType = {
    search: () => {
      if (queryboxRef.current) {
        console.log("🔍 Opening search...");
        queryboxRef.current.search();
      } else {
        console.warn("QueryBox not initialized yet");
      }
    },
    chat: () => {
      if (queryboxRef.current) {
        console.log("💬 Opening chat...");
        queryboxRef.current.chat();
      } else {
        console.warn("QueryBox not initialized yet");
      }
    },
    initializeForDomain,
    isReady,
  };

  return (
    <TestDemoContext.Provider value={value}>
      {children}
    </TestDemoContext.Provider>
  );
}

export function useTestDemo() {
  const context = useContext(TestDemoContext);
  if (!context) {
    throw new Error("useTestDemo must be used within TestDemoProvider");
  }
  return context;
}
