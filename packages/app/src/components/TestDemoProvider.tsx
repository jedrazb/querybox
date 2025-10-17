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
  initializeForDomain: (
    domain: string,
    config?: {
      theme?: "light" | "dark" | "auto";
      primaryColor?: string;
      title?: string;
      initialQuestions?: string[];
    }
  ) => Promise<void>;
  isReady: boolean;
  isModuleLoaded: boolean;
}

const TestDemoContext = createContext<TestDemoContextType | null>(null);

export function TestDemoProvider({ children }: { children: ReactNode }) {
  const queryboxRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isModuleLoaded, setIsModuleLoaded] = useState(false);

  // Load QueryBox module once on mount
  useEffect(() => {
    const loadQueryBoxModule = async () => {
      if (typeof window !== "undefined" && !QueryBox) {
        try {
          const module = await import("@jedrazb/querybox");
          QueryBox = module.default;
          console.log("✅ QueryBox module loaded");
          setIsModuleLoaded(true);
        } catch (error) {
          console.error("❌ Failed to load QueryBox module:", error);
          setIsModuleLoaded(false);
        }
      } else if (QueryBox) {
        setIsModuleLoaded(true);
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

  const initializeForDomain = async (
    domain: string,
    config?: {
      theme?: "light" | "dark" | "auto";
      primaryColor?: string;
      title?: string;
      initialQuestions?: string[];
    }
  ) => {
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
      // Initialize with custom domain and configuration
      queryboxRef.current = new QueryBox({
        apiEndpoint: `/api/${domain}/v1`,
        theme: config?.theme || "auto",
        primaryColor: config?.primaryColor || "#ec4899",
        title: config?.title,
        initialQuestions: config?.initialQuestions,
      });

      setIsReady(true);
    } catch (error) {
      console.error("❌ Failed to initialize QueryBox:", error);
      setIsReady(false);
    }
  };

  const value: TestDemoContextType = {
    search: () => {
      if (queryboxRef.current) {
        queryboxRef.current.search();
      }
    },
    chat: () => {
      if (queryboxRef.current) {
        queryboxRef.current.chat();
      }
    },
    initializeForDomain,
    isReady,
    isModuleLoaded,
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
