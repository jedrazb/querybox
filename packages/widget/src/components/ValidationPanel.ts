import { BasePanel } from "./BasePanel";
import type { QueryBoxConfig } from "@jedrazb/querybox-shared";

// Type for validated config with all required fields and optional title
type ValidatedConfig = Required<Omit<QueryBoxConfig, "title">> &
  Pick<QueryBoxConfig, "title">;

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation panel component - displays configuration errors
 */
export class ValidationPanel extends BasePanel {
  private errors: ValidationError[];

  constructor(
    config: Partial<QueryBoxConfig>,
    container: HTMLElement,
    errors: ValidationError[]
  ) {
    // Create a minimal valid config for BasePanel
    const minimalConfig: ValidatedConfig = {
      apiEndpoint: config.apiEndpoint || "",
      container: config.container || document.body,
      theme: config.theme || "auto",
      primaryColor: config.primaryColor || "#007aff",
      title: config.title,
      classNames: config.classNames || {},
    };
    super(minimalConfig, container);
    this.errors = errors;
  }

  protected createPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = `querybox-panel querybox-validation-panel ${
      this.config.classNames.panel || ""
    }`;

    const errorsList = this.errors
      .map(
        (error) => `
      <li class="querybox-validation__error-item">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="querybox-validation__error-icon">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M10 6v4M10 13v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div>
          <strong>${this.escapeHtml(error.field)}</strong>: ${this.escapeHtml(
          error.message
        )}
        </div>
      </li>
    `
      )
      .join("");

    panel.innerHTML = `
      <div class="querybox-panel__header">
        <h2 class="querybox-panel__title">Configuration Required</h2>
        <button class="querybox-panel__close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="querybox-validation__content">
        <div class="querybox-validation__intro">
          <p>QueryBox requires proper configuration to work. Please fix the following issues:</p>
        </div>

        <ul class="querybox-validation__error-list">
          ${errorsList}
        </ul>

        <div class="querybox-validation__help">
          <h3>📖 Need Help?</h3>
          <p>Check out our documentation for detailed configuration instructions:</p>
          <div class="querybox-validation__links">
            <a href="https://jedrazb.github.io/querybox/docs/QUICKSTART.html" target="_blank" class="querybox-validation__link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 016 6v1a2 2 0 01-4 0V8a4 4 0 10-4 4h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Quick Start Guide
            </a>
            <a href="https://jedrazb.github.io/querybox/docs/CONFIG.html" target="_blank" class="querybox-validation__link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 5h4M6 8h4M6 11h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Configuration Guide
            </a>
          </div>
        </div>
    `;

    // Set up event listeners
    const closeButton = panel.querySelector(".querybox-panel__close");
    closeButton?.addEventListener("click", () => this.close());

    return panel;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  protected onOpen(): void {
    // Focus management if needed
  }
}
