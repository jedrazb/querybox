import type { QueryBoxConfig } from "@jedrazb/querybox-shared";
import { UnifiedPanel } from "./components/UnifiedPanel";
import {
  ValidationPanel,
  type ValidationError,
} from "./components/ValidationPanel";

/**
 * Main QueryBox widget class
 * Provides search() and chat() methods to open the panel in the appropriate mode
 */
export class QueryBox {
  private config: Partial<QueryBoxConfig>;
  private validConfig: Required<QueryBoxConfig> | null = null;
  private panel: UnifiedPanel | ValidationPanel | null = null;
  private container: HTMLElement;
  private validationErrors: ValidationError[] = [];
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(config: QueryBoxConfig) {
    this.config = config;

    // Validate configuration and collect errors
    this.validationErrors = this.validateConfig(config);

    // If no errors, create valid config
    if (this.validationErrors.length === 0) {
      this.validConfig = {
        apiEndpoint: config.apiEndpoint,
        container: config.container || document.body,
        theme: config.theme || "auto",
        classNames: config.classNames || {},
      };
    }

    // Resolve container
    const containerValue = config.container || document.body;
    if (typeof containerValue === "string") {
      const element = document.querySelector(containerValue);
      if (!element) {
        console.error(
          `QueryBox: container "${containerValue}" not found, using document.body`
        );
        this.container = document.body;
      } else {
        this.container = element as HTMLElement;
      }
    } else {
      this.container = containerValue as HTMLElement;
    }

    this.init();
  }

  /**
   * Validate configuration and return list of errors
   */
  private validateConfig(config: Partial<QueryBoxConfig>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!config.apiEndpoint) {
      errors.push({
        field: "apiEndpoint",
        message:
          "API endpoint is required (e.g., https://api.querybox.io/api/querybox/yourdomain.com/v1)",
      });
    } else {
      // Validate URL format
      try {
        new URL(config.apiEndpoint);
      } catch {
        errors.push({
          field: "apiEndpoint",
          message: "API endpoint must be a valid URL",
        });
      }
    }

    return errors;
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
    const theme = this.config.theme || "auto";
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
    // If there are validation errors, show validation panel
    if (this.validationErrors.length > 0) {
      this.showValidationPanel();
      return;
    }

    if (!this.panel) {
      this.panel = new UnifiedPanel(
        this.validConfig!,
        this.container,
        "search"
      );
    }

    if (
      this.panel instanceof UnifiedPanel &&
      this.panel.getCurrentMode() !== "search"
    ) {
      this.panel.switchToMode("search");
    }

    this.panel.open();
    this.setupEscapeHandler();
  }

  /**
   * Open the panel in chat mode
   */
  public chat(): void {
    // If there are validation errors, show validation panel
    if (this.validationErrors.length > 0) {
      this.showValidationPanel();
      return;
    }

    if (!this.panel) {
      this.panel = new UnifiedPanel(this.validConfig!, this.container, "chat");
    }

    if (
      this.panel instanceof UnifiedPanel &&
      this.panel.getCurrentMode() !== "chat"
    ) {
      this.panel.switchToMode("chat");
    }

    this.panel.open();
    this.setupEscapeHandler();
  }

  /**
   * Show validation panel with configuration errors
   */
  private showValidationPanel(): void {
    if (!this.panel || !(this.panel instanceof ValidationPanel)) {
      // Destroy existing panel if it's not a validation panel
      if (this.panel) {
        this.panel.destroy();
      }
      this.panel = new ValidationPanel(
        this.config,
        this.container,
        this.validationErrors
      );
    }
    this.panel.open();
    this.setupEscapeHandler();
  }

  /**
   * Set up escape key handler to close the panel
   */
  private setupEscapeHandler(): void {
    // Remove existing handler if any
    this.removeEscapeHandler();

    // Create new handler
    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.panel) {
        this.panel.close();
        this.removeEscapeHandler();
      }
    };

    // Add listener
    document.addEventListener("keydown", this.escapeHandler);
  }

  /**
   * Remove escape key handler
   */
  private removeEscapeHandler(): void {
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
      this.escapeHandler = null;
    }
  }

  /**
   * Destroy the widget and clean up
   */
  public destroy(): void {
    this.removeEscapeHandler();
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<Partial<QueryBoxConfig>> {
    return { ...this.config };
  }

  /**
   * Check if configuration is valid
   */
  public isValid(): boolean {
    return this.validationErrors.length === 0;
  }

  /**
   * Get validation errors
   */
  public getValidationErrors(): ReadonlyArray<ValidationError> {
    return [...this.validationErrors];
  }
}
