import type { QueryBoxConfig } from "@jedrazb/querybox-shared";

// Type for validated config with all required fields and optional title
type ValidatedConfig = Required<Omit<QueryBoxConfig, "title">> &
  Pick<QueryBoxConfig, "title">;

/**
 * Base panel class with common functionality
 */
export abstract class BasePanel {
  protected config: ValidatedConfig;
  protected container: HTMLElement;
  protected overlay: HTMLElement | null = null;
  protected panel: HTMLElement | null = null;
  protected isOpen: boolean = false;

  constructor(config: ValidatedConfig, container: HTMLElement) {
    this.config = config;
    this.container = container;
  }

  /**
   * Create the overlay element
   */
  protected createOverlay(): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = `querybox-overlay ${
      this.config.classNames.overlay || ""
    }`;
    overlay.addEventListener("click", () => this.close());
    return overlay;
  }

  /**
   * Create the panel element
   */
  protected abstract createPanel(): HTMLElement;

  /**
   * Open the panel
   */
  public open(): void {
    if (this.isOpen) return;

    if (!this.overlay) {
      this.overlay = this.createOverlay();
      this.container.appendChild(this.overlay);
    }

    if (!this.panel) {
      this.panel = this.createPanel();
      this.container.appendChild(this.panel);
    }

    // Trigger reflow for animation
    requestAnimationFrame(() => {
      if (this.overlay) this.overlay.classList.add("querybox-overlay--visible");
      if (this.panel) this.panel.classList.add("querybox-panel--visible");
    });

    this.isOpen = true;
    this.onOpen();
  }

  /**
   * Close the panel
   */
  public close(): void {
    if (!this.isOpen) return;

    if (this.overlay) {
      this.overlay.classList.remove("querybox-overlay--visible");
    }

    if (this.panel) {
      this.panel.classList.remove("querybox-panel--visible");
    }

    this.isOpen = false;
    this.onClose();
  }

  /**
   * Hide the panel without closing (for mode switching)
   */
  public hide(): void {
    if (this.panel) {
      this.panel.style.display = "none";
    }
  }

  /**
   * Show the panel (for mode switching)
   */
  public show(): void {
    if (!this.overlay) {
      this.overlay = this.createOverlay();
      this.container.appendChild(this.overlay);
    }

    if (!this.panel) {
      this.panel = this.createPanel();
      this.container.appendChild(this.panel);
    }

    this.panel.style.display = "";

    // Ensure visibility
    if (!this.isOpen) {
      requestAnimationFrame(() => {
        if (this.overlay)
          this.overlay.classList.add("querybox-overlay--visible");
        if (this.panel) this.panel.classList.add("querybox-panel--visible");
      });
      this.isOpen = true;
      this.onOpen();
    }
  }

  /**
   * Get the panel element
   */
  public getElement(): HTMLElement | null {
    return this.panel;
  }

  /**
   * Destroy the panel and clean up
   */
  public destroy(): void {
    this.close();

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }

  /**
   * Hook called when panel opens
   */
  protected onOpen(): void {
    // Override in subclasses
  }

  /**
   * Hook called when panel closes
   */
  protected onClose(): void {
    // Override in subclasses
  }
}
