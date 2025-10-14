import { BasePanel } from "./BasePanel";
import { ElasticsearchClient } from "../api/elasticsearch";
import { ChatClient } from "../api/chat-client";
import type {
  QueryBoxConfig,
  SearchResult,
  ChatMessage,
  ChatChunk,
} from "../types";

export type PanelMode = "search" | "chat";

/**
 * Unified panel that switches between search and chat modes
 */
export class UnifiedPanel extends BasePanel {
  private currentMode: PanelMode = "search";
  private searchInput: HTMLInputElement | null = null;
  private chatInput: HTMLInputElement | null = null;
  private searchContainer: HTMLElement | null = null;
  private chatContainer: HTMLElement | null = null;
  private searchDebounceTimer: number | null = null;
  private elasticsearchClient: ElasticsearchClient;
  private chatClient: ChatClient;
  private messages: ChatMessage[] = [];

  constructor(
    config: Required<QueryBoxConfig>,
    container: HTMLElement,
    initialMode: PanelMode = "search"
  ) {
    super(config, container);
    this.currentMode = initialMode;
    this.elasticsearchClient = new ElasticsearchClient(
      config.host,
      config.apiKey
    );
    this.chatClient = new ChatClient({
      host: config.host,
      apiKey: config.apiKey,
      agentId: config.agentId,
    });
  }

  protected createPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = `querybox-panel ${
      this.config.classNames.searchPanel || ""
    }`;

    panel.innerHTML = `
      <div class="querybox-panel__header">
        <h2 class="querybox-panel__title">${this.getModeTitle()}</h2>
        <div class="querybox-mode-switcher">
          <button class="querybox-mode-btn ${
            this.currentMode === "search" ? "active" : ""
          }" data-mode="search" title="Switch to Search">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
              <path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Search</span>
          </button>
          <button class="querybox-mode-btn ${
            this.currentMode === "chat" ? "active" : ""
          }" data-mode="chat" title="Switch to Chat">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M17 8.5a6.5 6.5 0 0 1-6.5 6.5c-.5 0-1-.1-1.5-.2L4 17l1.7-4.5c-.4-.8-.7-1.6-.7-2.5a6.5 6.5 0 0 1 13 0z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <span>Ask</span>
          </button>
        </div>
        <button class="querybox-panel__close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="querybox-unified-body">
        ${this.createSearchContent()}
        ${this.createChatContent()}
      </div>
    `;

    this.setupEventListeners(panel);
    this.showMode(this.currentMode);

    return panel;
  }

  private createSearchContent(): string {
    return `
      <div class="querybox-search-container" style="display: none;">
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
      </div>
    `;
  }

  private createChatContent(): string {
    return `
      <div class="querybox-chat-container" style="display: none;">
        <div class="querybox-chat__messages">
          <div class="querybox-chat__welcome">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/>
              <path d="M14 18h4M22 18h4M14 24h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>Hello! How can I help you today?</p>
          </div>
        </div>
        <div class="querybox-chat__input-wrapper">
          <input
            type="text"
            class="querybox-chat__input"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button class="querybox-chat__send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 10l16-8-8 16-2-8-6-0z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private setupEventListeners(panel: HTMLElement): void {
    // Close button
    const closeButton = panel.querySelector(".querybox-panel__close");
    closeButton?.addEventListener("click", () => this.close());

    // Mode switcher buttons
    const searchBtn = panel.querySelector('[data-mode="search"]');
    const chatBtn = panel.querySelector('[data-mode="chat"]');

    searchBtn?.addEventListener("click", () => this.switchToMode("search"));
    chatBtn?.addEventListener("click", () => this.switchToMode("chat"));

    // Search container
    this.searchContainer = panel.querySelector(".querybox-search-container");
    this.searchInput = panel.querySelector(".querybox-search__input");

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

    // Chat container
    this.chatContainer = panel.querySelector(".querybox-chat-container");
    this.chatInput = panel.querySelector(".querybox-chat__input");

    const sendButton = panel.querySelector(".querybox-chat__send");
    sendButton?.addEventListener("click", () => this.handleSend());

    if (this.chatInput) {
      this.chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        } else if (e.key === "Escape") {
          this.close();
        }
      });
    }
  }

  /**
   * Switch to a specific mode
   */
  public switchToMode(mode: PanelMode): void {
    if (mode === this.currentMode) return;

    this.currentMode = mode;
    this.showMode(mode);
    this.updateModeButtons();
    this.updateTitle();
    this.focusInput();
  }

  /**
   * Show the content for the specified mode
   */
  private showMode(mode: PanelMode): void {
    if (!this.searchContainer || !this.chatContainer) return;

    if (mode === "search") {
      this.searchContainer.style.display = "flex";
      this.chatContainer.style.display = "none";
    } else {
      this.searchContainer.style.display = "none";
      this.chatContainer.style.display = "flex";
    }
  }

  /**
   * Update mode button active states
   */
  private updateModeButtons(): void {
    if (!this.panel) return;

    const buttons = this.panel.querySelectorAll(".querybox-mode-btn");
    buttons.forEach((btn) => {
      const mode = btn.getAttribute("data-mode");
      if (mode === this.currentMode) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  /**
   * Update panel title
   */
  private updateTitle(): void {
    if (!this.panel) return;

    const title = this.panel.querySelector(".querybox-panel__title");
    if (title) {
      title.textContent = this.getModeTitle();
    }
  }

  /**
   * Get title for current mode
   */
  private getModeTitle(): string {
    return this.currentMode === "search" ? "Search" : "Chat Assistant";
  }

  /**
   * Focus the appropriate input field
   */
  private focusInput(): void {
    setTimeout(() => {
      if (this.currentMode === "search") {
        this.searchInput?.focus();
      } else {
        this.chatInput?.focus();
      }
    }, 100);
  }

  /**
   * Get current mode
   */
  public getCurrentMode(): PanelMode {
    return this.currentMode;
  }

  /**
   * Handle search input with debouncing
   */
  private handleSearch(query: string): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    if (!query.trim()) {
      this.showEmptyState();
      return;
    }

    this.showLoadingState();

    this.searchDebounceTimer = window.setTimeout(async () => {
      try {
        const response = await this.elasticsearchClient.search(query);
        this.displayResults(response.results);
      } catch (error) {
        this.showErrorState(error as Error);
      }
    }, 300);
  }

  private showEmptyState(): void {
    const resultsContainer = this.panel?.querySelector(
      ".querybox-search__results"
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="querybox-search__empty">
          <p>Start typing to search...</p>
        </div>
      `;
    }
  }

  private showLoadingState(): void {
    const resultsContainer = this.panel?.querySelector(
      ".querybox-search__results"
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="querybox-search__loading">
          <div class="querybox-spinner"></div>
          <p>Searching...</p>
        </div>
      `;
    }
  }

  private showErrorState(error: Error): void {
    const resultsContainer = this.panel?.querySelector(
      ".querybox-search__results"
    );
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="querybox-search__error">
          <p>Search failed</p>
          <small>${error.message}</small>
        </div>
      `;
    }
  }

  private displayResults(results: SearchResult[]): void {
    const resultsContainer = this.panel?.querySelector(
      ".querybox-search__results"
    );

    if (!resultsContainer) return;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="querybox-search__empty">
          <p>No results found</p>
        </div>
      `;
      return;
    }

    const resultsHtml = results
      .map(
        (result) => `
      <div class="querybox-search__result">
        <h3 class="querybox-search__result-title">${this.escapeHtml(
          result.title
        )}</h3>
        <p class="querybox-search__result-content">${this.escapeHtml(
          result.content
        )}</p>
        ${
          result.url
            ? `<a href="${result.url}" class="querybox-search__result-link" target="_blank">
            View →
          </a>`
            : ""
        }
      </div>
    `
      )
      .join("");

    resultsContainer.innerHTML = `<div class="querybox-search__results-list">${resultsHtml}</div>`;
  }

  /**
   * Handle sending a chat message
   */
  private async handleSend(): Promise<void> {
    if (!this.chatInput) return;

    const message = this.chatInput.value.trim();
    if (!message) return;

    this.chatInput.value = "";

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    this.addMessage(userMessage);

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      toolCalls: [],
    };

    this.addMessage(assistantMessage);

    try {
      await this.chatClient.sendMessage(message, (chunk: ChatChunk) => {
        this.handleChatChunk(assistantMessageId, chunk);
      });
    } catch (error) {
      this.handleChatError(assistantMessageId, error as Error);
    }
  }

  private handleChatChunk(messageId: string, chunk: ChatChunk): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return;

    switch (chunk.type) {
      case "text":
        if (chunk.content) {
          message.content += chunk.content;
          this.renderMessages();
        }
        break;

      case "tool_call":
        if (chunk.toolCall) {
          message.toolCalls = message.toolCalls || [];
          message.toolCalls.push(chunk.toolCall);
          this.renderMessages();
        }
        break;

      case "tool_result":
        if (chunk.toolCall) {
          const toolCall = message.toolCalls?.find(
            (tc) => tc.id === chunk.toolCall!.id
          );
          if (toolCall) {
            toolCall.result = chunk.toolCall.result;
            this.renderMessages();
          }
        }
        break;

      case "done":
        break;
    }
  }

  private handleChatError(messageId: string, error: Error): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return;

    message.content = `Sorry, an error occurred: ${error.message}`;
    this.renderMessages();
  }

  private addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.renderMessages();
  }

  private renderMessages(): void {
    const messagesContainer = this.panel?.querySelector(
      ".querybox-chat__messages"
    );
    if (!messagesContainer) return;

    if (this.messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="querybox-chat__welcome">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/>
            <path d="M14 18h4M22 18h4M14 24h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Hello! How can I help you today?</p>
        </div>
      `;
      return;
    }

    const messagesHtml = this.messages
      .map((message) => {
        const toolCallsHtml =
          message.toolCalls
            ?.map(
              (toolCall) => `
        <div class="querybox-chat__tool-call">
          <div class="querybox-chat__tool-call-header">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Using tool: ${this.escapeHtml(toolCall.name)}</span>
          </div>
          ${
            toolCall.result
              ? '<div class="querybox-chat__tool-call-result">✓ Complete</div>'
              : '<div class="querybox-chat__tool-call-pending">⏳ Running...</div>'
          }
        </div>
      `
            )
            .join("") || "";

        return `
        <div class="querybox-chat__message querybox-chat__message--${
          message.role
        }">
          <div class="querybox-chat__message-content">
            ${
              message.content
                ? `<p>${this.escapeHtml(message.content)}</p>`
                : '<div class="querybox-spinner"></div>'
            }
            ${toolCallsHtml}
          </div>
        </div>
      `;
      })
      .join("");

    messagesContainer.innerHTML = messagesHtml;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  protected onOpen(): void {
    this.focusInput();
  }

  public destroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.messages = [];
    super.destroy();
  }
}
