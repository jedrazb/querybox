import { QueryBox } from "./QueryBox";
import type { PanelMode } from "./components/UnifiedPanel";
import type { ValidationError } from "./components/ValidationPanel";
import "./styles/main.css";

// Export main class and types
export { QueryBox };
export type { PanelMode, ValidationError };

// Re-export types from shared package
export type * from "@jedrazb/querybox-shared";

// For UMD/browser usage, attach to window
if (typeof window !== "undefined") {
  (window as any).QueryBox = QueryBox;
}

// Default export
export default QueryBox;
