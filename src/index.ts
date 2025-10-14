import { QueryBox } from "./QueryBox";
import type { PanelMode } from "./components/UnifiedPanel";
import type { ValidationError } from "./components/ValidationPanel";
import "./styles/main.css";

// Export main class and types
export { QueryBox };
export type { PanelMode, ValidationError };
export type * from "./types";

// For UMD/browser usage, attach to window
if (typeof window !== "undefined") {
  (window as any).QueryBox = QueryBox;
}

// Default export
export default QueryBox;
