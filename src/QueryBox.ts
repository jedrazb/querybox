import type { QueryBoxConfig } from "./types";
import { UnifiedPanel } from "./components/UnifiedPanel";

/**
 * Main QueryBox widget class
 * Provides search() and chat() methods to open the panel in the appropriate mode
 */
export class QueryBox {
  private config: Required<QueryBoxConfig>;
  private panel: UnifiedPanel | null = null;
  private container: HTMLElement;

  constructor(config: QueryBoxConfig) {
    // Validate required config
    if (!config.host) {
      throw new Error("QueryBox: host is required");
    }
    if (!config.apiKey) {
      throw new Error("QueryBox: apiKey is required");
    }

    // Set defaults
    this.config = {
      host: config.host,
      apiKey: config.apiKey,
      agentId: config.agentId || "",
      container: config.container || document.body,
      theme: config.theme || "auto",
      classNames: config.classNames || {},
    };

    // Resolve container
    if (typeof this.config.container === "string") {
      const element = document.querySelector(this.config.container);
      if (!element) {
        throw new Error(
          `QueryBox: container "${this.config.container}" not found`
        );
      }
      this.container = element as HTMLElement;
    } else {
      this.container = this.config.container as HTMLElement;
    }

    this.init();
  }

  /**
   * Initialize the widget
   */
  private init(): void {
    // Apply theme
    this.applyTheme();

    // Load styles if not already loaded
    this.loadStyles();
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(): void {
    const theme = this.config.theme;
    if (theme === "auto") {
      // Auto-detect based on system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.setAttribute(
        "data-querybox-theme",
        prefersDark ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-querybox-theme", theme);
    }
  }

  /**
   * Load styles (CSS is automatically injected by Vite)
   */
  private loadStyles(): void {
    // Styles are automatically injected when using the widget
    // This is a placeholder for any runtime style adjustments
  }

  /**
   * Open the panel in search mode
   */
  public search(): void {
    if (!this.panel) {
      this.panel = new UnifiedPanel(this.config, this.container, "search");
    }

    if (this.panel.getCurrentMode() !== "search") {
      this.panel.switchToMode("search");
    }

    this.panel.open();
  }

  /**
   * Open the panel in chat mode
   */
  public chat(): void {
    if (!this.panel) {
      this.panel = new UnifiedPanel(this.config, this.container, "chat");
    }

    if (this.panel.getCurrentMode() !== "chat") {
      this.panel.switchToMode("chat");
    }

    this.panel.open();
  }

  /**
   * Destroy the widget and clean up
   */
  public destroy(): void {
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<Required<QueryBoxConfig>> {
    return { ...this.config };
  }
}
