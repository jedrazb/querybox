import type { QueryBoxConfig } from "./types";
import { SearchPanel } from "./components/SearchPanel";
import { ChatPanel } from "./components/ChatPanel";

/**
 * Main QueryBox widget class
 * Provides search() and chat() methods to open respective panels
 */
export class QueryBox {
  private config: Required<QueryBoxConfig>;
  private searchPanel: SearchPanel | null = null;
  private chatPanel: ChatPanel | null = null;
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
   * Open the search panel
   */
  public search(): void {
    // Close chat panel if open
    if (this.chatPanel) {
      this.chatPanel.close();
    }

    // Create or reopen search panel
    if (!this.searchPanel) {
      this.searchPanel = new SearchPanel(this.config, this.container);
    }

    this.searchPanel.open();
  }

  /**
   * Open the chat panel
   */
  public chat(): void {
    // Close search panel if open
    if (this.searchPanel) {
      this.searchPanel.close();
    }

    // Create or reopen chat panel
    if (!this.chatPanel) {
      this.chatPanel = new ChatPanel(this.config, this.container);
    }

    this.chatPanel.open();
  }

  /**
   * Destroy the widget and clean up
   */
  public destroy(): void {
    if (this.searchPanel) {
      this.searchPanel.destroy();
      this.searchPanel = null;
    }

    if (this.chatPanel) {
      this.chatPanel.destroy();
      this.chatPanel = null;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<Required<QueryBoxConfig>> {
    return { ...this.config };
  }
}
