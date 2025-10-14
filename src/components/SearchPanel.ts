import { BasePanel } from "./BasePanel";
import { ElasticsearchClient } from "../api/elasticsearch";
import type { QueryBoxConfig, SearchResult } from "../types";

/**
 * Search panel component
 */
export class SearchPanel extends BasePanel {
  private searchInput: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private elasticsearchClient: ElasticsearchClient;
  private searchDebounceTimer: number | null = null;

  constructor(config: Required<QueryBoxConfig>, container: HTMLElement) {
    super(config, container);
    this.elasticsearchClient = new ElasticsearchClient(
      config.host,
      config.apiKey
    );
  }

  protected createPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = `querybox-panel querybox-search-panel ${
      this.config.classNames.searchPanel || ""
    }`;

    panel.innerHTML = `
      <div class="querybox-panel__header">
        <h2 class="querybox-panel__title">Search</h2>
        <button class="querybox-panel__close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="querybox-search__input-wrapper">
        <svg class="querybox-search__icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
          <path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          type="text"
          class="querybox-search__input"
          placeholder="Search..."
          autocomplete="off"
        />
      </div>
      <div class="querybox-search__results">
        <div class="querybox-search__empty">
          <p>Start typing to search...</p>
        </div>
      </div>
    `;

    // Set up event listeners
    this.searchInput = panel.querySelector(".querybox-search__input");
    this.resultsContainer = panel.querySelector(".querybox-search__results");

    const closeButton = panel.querySelector(".querybox-panel__close");
    closeButton?.addEventListener("click", () => this.close());

    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.handleSearch((e.target as HTMLInputElement).value);
      });

      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.close();
        }
      });
    }

    return panel;
  }

  /**
   * Handle search input with debouncing
   */
  private handleSearch(query: string): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = window.setTimeout(async () => {
      await this.performSearch(query);
    }, 300);
  }

  /**
   * Perform the actual search
   */
  private async performSearch(query: string): Promise<void> {
    if (!this.resultsContainer) return;

    if (!query.trim()) {
      this.resultsContainer.innerHTML = `
        <div class="querybox-search__empty">
          <p>Start typing to search...</p>
        </div>
      `;
      return;
    }

    // Show loading state
    this.resultsContainer.innerHTML = `
      <div class="querybox-search__loading">
        <div class="querybox-spinner"></div>
        <p>Searching...</p>
      </div>
    `;

    try {
      const response = await this.elasticsearchClient.search(query);
      this.renderResults(response.results, query);
    } catch (error) {
      this.renderError(error as Error);
    }
  }

  /**
   * Render search results
   */
  private renderResults(results: SearchResult[], query: string): void {
    if (!this.resultsContainer) return;

    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="querybox-search__empty">
          <p>No results found for "${this.escapeHtml(query)}"</p>
        </div>
      `;
      return;
    }

    const resultsHtml = results
      .map(
        (result) => `
      <div class="querybox-search__result" data-id="${this.escapeHtml(
        result.id
      )}">
        <h3 class="querybox-search__result-title">${this.escapeHtml(
          result.title
        )}</h3>
        <p class="querybox-search__result-content">${this.escapeHtml(
          result.content
        )}</p>
        ${
          result.url
            ? `<a href="${this.escapeHtml(
                result.url
              )}" class="querybox-search__result-link" target="_blank">View more →</a>`
            : ""
        }
      </div>
    `
      )
      .join("");

    this.resultsContainer.innerHTML = `
      <div class="querybox-search__results-list">
        ${resultsHtml}
      </div>
    `;
  }

  /**
   * Render error state
   */
  private renderError(error: Error): void {
    if (!this.resultsContainer) return;

    this.resultsContainer.innerHTML = `
      <div class="querybox-search__error">
        <p>An error occurred while searching. Please try again.</p>
        <small>${this.escapeHtml(error.message)}</small>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  protected onOpen(): void {
    // Focus the search input when opened
    setTimeout(() => {
      this.searchInput?.focus();
    }, 100);
  }

  public destroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    super.destroy();
  }
}
