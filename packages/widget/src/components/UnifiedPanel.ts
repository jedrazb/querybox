import { BasePanel } from "./BasePanel";
import { SearchClient } from "../api/elasticsearch";
import { ChatClient } from "../api/chat-client";
import type {
  QueryBoxConfig,
  SearchResult,
  ChatMessage,
  ChatChunk,
} from "@jedrazb/querybox-shared";
import { QUERYBOX_WEBSITE_URL } from "@jedrazb/querybox-shared";
import { marked } from "marked";

// Type for validated config with all required fields and optional title/initialQuestions
type ValidatedConfig = Required<
  Omit<QueryBoxConfig, "title" | "initialQuestions">
> &
  Pick<QueryBoxConfig, "title" | "initialQuestions">;

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
  private searchClient: SearchClient;
  private chatClient: ChatClient;
  private messages: ChatMessage[] = [];
  private messageElements: Map<string, HTMLElement> = new Map();

  constructor(
    config: ValidatedConfig,
    container: HTMLElement,
    initialMode: PanelMode = "search"
  ) {
    super(config, container);
    this.currentMode = initialMode;
    this.searchClient = new SearchClient(config.apiEndpoint);
    this.chatClient = new ChatClient(config.apiEndpoint);
  }

  protected createPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = `querybox-panel ${
      this.config.classNames.searchPanel || ""
    }`;

    panel.innerHTML = `
      <div class="querybox-panel__header">
        <div class="querybox-header__left">
          ${
            this.config.title
              ? `<span class="querybox-header__title">${this.escapeHtml(
                  this.config.title
                )}</span>`
              : ""
          }
          <a href="${QUERYBOX_WEBSITE_URL}" target="_blank" rel="noopener noreferrer" class="querybox-header-logo-link" aria-label="QueryBox">
            <svg width="143" height="16.5" viewBox="0 0 78 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.22 8.6L9.108 8.18L9.192 7.724L8.172 8C7.492 8 6.956 7.908 6.564 7.724C6.172 7.532 5.892 7.268 5.724 6.932C5.564 6.596 5.484 6.204 5.484 5.756C5.484 5.532 5.496 5.296 5.52 5.048C5.552 4.8 5.592 4.536 5.64 4.256C5.792 3.384 6.016 2.66 6.312 2.084C6.608 1.5 7.024 1.06 7.56 0.763999C8.096 0.467999 8.804 0.319999 9.684 0.319999C10.716 0.319999 11.444 0.528 11.868 0.944C12.292 1.36 12.504 1.976 12.504 2.792C12.504 3.312 12.448 3.828 12.336 4.34C12.224 4.844 12.076 5.304 11.892 5.72C11.716 6.136 11.524 6.468 11.316 6.716L12.06 7.22L11.22 8.6ZM6.72 0.896L3.048 0.5H7.26C7.164 0.556 7.072 0.616 6.984 0.68C6.896 0.743999 6.808 0.816 6.72 0.896ZM5.88 2.132L1.392 1.652H6.12C6.08 1.732 6.04 1.812 6 1.892C5.96 1.964 5.92 2.044 5.88 2.132ZM7.752 6.128H8.7C8.964 6.128 9.18 6.096 9.348 6.032C9.524 5.968 9.64 5.788 9.696 5.492L10.248 2.372H9.288C9.024 2.372 8.808 2.404 8.64 2.468C8.472 2.532 8.36 2.712 8.304 3.008L7.752 6.128ZM5.484 3.296L0.828 2.804H5.628L5.484 3.296ZM5.256 4.46L0.54 3.956H5.34L5.256 4.46ZM5.136 5.612L0.408 5.108H5.172C5.148 5.284 5.136 5.452 5.136 5.612ZM5.244 6.764L0.564 6.26H5.148C5.164 6.348 5.18 6.436 5.196 6.524C5.212 6.604 5.228 6.684 5.244 6.764ZM6.06 7.868L1.716 7.424H5.58C5.644 7.488 5.72 7.564 5.808 7.652C5.904 7.732 5.988 7.804 6.06 7.868ZM18.2212 8.18C17.5812 8.18 17.0692 8.12 16.6852 8C16.3012 7.872 16.0252 7.664 15.8572 7.376C15.6892 7.088 15.6052 6.708 15.6052 6.236C15.6052 6.028 15.6172 5.796 15.6412 5.54C15.6732 5.284 15.7172 5.008 15.7732 4.712L16.5172 0.5H18.7972L17.8012 6.128H18.6172C18.8732 6.128 19.0652 6.096 19.1932 6.032C19.3212 5.968 19.4132 5.788 19.4692 5.492L20.3572 0.5H22.6372L21.8932 4.712C21.7812 5.36 21.6412 5.908 21.4732 6.356C21.3132 6.796 21.0972 7.152 20.8252 7.424C20.5612 7.688 20.2172 7.88 19.7932 8C19.3692 8.12 18.8452 8.18 18.2212 8.18ZM16.0492 1.04L10.9732 0.5H16.1452L16.0492 1.04ZM15.8452 2.192L10.7692 1.652H15.9412L15.8452 2.192ZM15.6412 3.344L10.5532 2.804H15.7372L15.6412 3.344ZM15.4372 4.496L10.3612 3.956H15.5332L15.4372 4.496ZM15.2692 5.648L10.1932 5.108H15.3292C15.3212 5.204 15.3092 5.296 15.2932 5.384C15.2852 5.472 15.2772 5.56 15.2692 5.648ZM15.2812 6.8L10.2052 6.26H15.2452C15.2452 6.452 15.2572 6.632 15.2812 6.8ZM15.8332 7.964L10.7572 7.424H15.4492C15.5532 7.648 15.6812 7.828 15.8332 7.964ZM25.0066 8L26.3266 0.5H31.3426L30.7186 2.42H28.2586L28.0906 3.428H30.3706L30.0586 5.168H27.7786L27.6226 6.08H30.4186L30.0826 8H25.0066ZM25.8586 1.04L20.7826 0.5H25.9546L25.8586 1.04ZM25.6666 2.192L20.5786 1.652H25.7506L25.6666 2.192ZM25.4626 3.344L20.3746 2.804H25.5586L25.4626 3.344ZM25.2586 4.496L20.1706 3.956H25.3546L25.2586 4.496ZM25.0546 5.648L19.9666 5.108H25.1506L25.0546 5.648ZM24.8506 6.8L19.7626 6.26H24.9466L24.8506 6.8ZM24.6466 7.964L19.5586 7.424H24.7426L24.6466 7.964ZM33.7136 8L35.0336 0.5H38.6336C39.1536 0.5 39.5616 0.58 39.8576 0.74C40.1616 0.9 40.3736 1.12 40.4936 1.4C40.6216 1.672 40.6856 1.984 40.6856 2.336C40.6856 2.552 40.6616 2.808 40.6136 3.104C40.5736 3.4 40.4976 3.704 40.3856 4.016C40.2736 4.32 40.1136 4.604 39.9056 4.868C39.7056 5.132 39.4496 5.344 39.1376 5.504L39.9296 8H37.4216L36.8696 5.768H36.3776L35.9936 8H33.7136ZM34.5656 1.04L29.4896 0.5H34.6616L34.5656 1.04ZM34.3616 2.192L29.2856 1.652H34.4576L34.3616 2.192ZM36.7016 3.92H37.2296C37.4616 3.92 37.6576 3.896 37.8176 3.848C37.9776 3.792 38.0776 3.648 38.1176 3.416C38.1576 3.216 38.1816 3.064 38.1896 2.96C38.2056 2.856 38.2136 2.8 38.2136 2.792C38.2136 2.616 38.1376 2.512 37.9856 2.48C37.8416 2.44 37.6536 2.42 37.4216 2.42H36.9656L36.7016 3.92ZM34.1576 3.344L29.0816 2.804H34.2536L34.1576 3.344ZM33.9536 4.496L28.8776 3.956H34.0496L33.9536 4.496ZM33.7616 5.648L28.6736 5.108H33.8576L33.7616 5.648ZM33.5576 6.8L28.4696 6.26H33.6536L33.5576 6.8ZM33.3536 7.964L28.2656 7.424H33.4496L33.3536 7.964ZM43.9727 8L44.3207 5.96L43.2407 0.5H45.7607L45.9167 3.14H46.0007L47.1047 0.5H49.6247L46.6007 5.96L46.2527 8H43.9727ZM42.9887 1.04L37.9127 0.5H42.8807L42.9887 1.04ZM43.2047 2.192L38.1287 1.652H43.0967L43.2047 2.192ZM43.4327 3.344L38.3567 2.804H43.3247L43.4327 3.344ZM43.6607 4.496L38.5727 3.956H43.5527L43.6607 4.496ZM43.8887 5.648L38.8007 5.108H43.7807L43.8887 5.648ZM43.8047 6.8L38.7287 6.26H43.8887L43.8047 6.8ZM43.6007 7.964L38.5247 7.424H43.6967L43.6007 7.964ZM51.1043 8L52.4243 0.5H56.1203C56.7043 0.5 57.1243 0.6 57.3803 0.8C57.6363 1 57.7643 1.308 57.7643 1.724C57.7643 2.364 57.6203 2.876 57.3323 3.26C57.0523 3.636 56.7363 3.868 56.3843 3.956L56.3723 4.028C56.7643 4.1 57.0403 4.264 57.2003 4.52C57.3683 4.776 57.4523 5.088 57.4523 5.456C57.4523 5.904 57.3683 6.324 57.2003 6.716C57.0403 7.1 56.7923 7.412 56.4563 7.652C56.1283 7.884 55.7123 8 55.2083 8H51.1043ZM51.9563 1.04L46.8802 0.5H52.0523L51.9563 1.04ZM51.7643 2.192L46.6762 1.652H51.8483L51.7643 2.192ZM54.2123 3.26H54.9203C55.1283 3.26 55.2723 3.18 55.3523 3.02C55.4323 2.86 55.4723 2.68 55.4723 2.48C55.4723 2.376 55.4483 2.296 55.4003 2.24C55.3523 2.176 55.2643 2.144 55.1363 2.144H54.4163L54.2123 3.26ZM51.5603 3.344L46.4722 2.804H51.6562L51.5603 3.344ZM51.3563 4.496L46.2682 3.956H51.4523L51.3563 4.496ZM53.6843 6.236H54.5723C54.7883 6.236 54.9443 6.152 55.0403 5.984C55.1363 5.816 55.1843 5.62 55.1843 5.396C55.1843 5.284 55.1563 5.192 55.1003 5.12C55.0443 5.048 54.9443 5.012 54.8003 5.012H53.9003L53.6843 6.236ZM51.1523 5.648L46.0642 5.108H51.2483L51.1523 5.648ZM50.9483 6.8L45.8602 6.26H51.0443L50.9483 6.8ZM50.7443 7.964L45.6562 7.424H50.8403L50.7443 7.964ZM63.2532 8.18C62.2132 8.18 61.4812 7.976 61.0572 7.568C60.6412 7.16 60.4332 6.556 60.4332 5.756C60.4332 5.532 60.4452 5.296 60.4692 5.048C60.5012 4.8 60.5412 4.536 60.5892 4.256C60.7412 3.384 60.9652 2.66 61.2612 2.084C61.5572 1.5 61.9732 1.06 62.5092 0.763999C63.0452 0.467999 63.7532 0.319999 64.6332 0.319999C65.6732 0.319999 66.4012 0.523999 66.8172 0.931999C67.2412 1.332 67.4532 1.936 67.4532 2.744C67.4532 3.072 67.4252 3.448 67.3692 3.872C67.3212 4.296 67.2332 4.728 67.1052 5.168C66.9852 5.608 66.8212 6.024 66.6132 6.416C66.4052 6.808 66.1452 7.144 65.8332 7.424C65.5132 7.704 65.1412 7.9 64.7172 8.012C64.2932 8.124 63.8052 8.18 63.2532 8.18ZM61.6692 0.896L57.9972 0.5H62.2092C62.1132 0.556 62.0212 0.616 61.9332 0.68C61.8452 0.743999 61.7572 0.816 61.6692 0.896ZM60.8292 2.132L56.3412 1.652H61.0692C61.0292 1.732 60.9892 1.812 60.9492 1.892C60.9092 1.964 60.8692 2.044 60.8292 2.132ZM62.7012 6.128H63.6492C63.9132 6.128 64.1292 6.096 64.2972 6.032C64.4732 5.968 64.5892 5.788 64.6452 5.492L65.1972 2.372H64.2372C63.9732 2.372 63.7572 2.404 63.5892 2.468C63.4212 2.532 63.3092 2.712 63.2532 3.008L62.7012 6.128ZM60.4332 3.296L55.7772 2.804H60.5772L60.4332 3.296ZM60.2052 4.46L55.4892 3.956H60.2892L60.2532 4.196C60.2452 4.244 60.2372 4.292 60.2292 4.34C60.2212 4.38 60.2132 4.42 60.2052 4.46ZM60.0852 5.612L55.3572 5.108H60.1212C60.0972 5.284 60.0852 5.452 60.0852 5.612ZM60.1812 6.764L55.5132 6.26H60.0972C60.1132 6.348 60.1252 6.436 60.1332 6.524C60.1492 6.604 60.1652 6.684 60.1812 6.764ZM60.8172 7.868L56.6652 7.424H60.4572C60.5612 7.608 60.6812 7.756 60.8172 7.868ZM69.5344 8L71.7424 4.196L70.8544 0.5H73.4464L73.8664 2.504H73.9864L75.1264 0.5H77.5984L75.3664 4.124L76.2784 8H73.7464L73.2664 5.84H73.1704L71.9464 8H69.5344ZM70.6144 1.04L65.5384 0.5H70.4824C70.4984 0.588 70.5184 0.68 70.5424 0.775999C70.5664 0.864 70.5904 0.952 70.6144 1.04ZM70.8904 2.192L65.8144 1.652H70.7584C70.7744 1.74 70.7944 1.832 70.8184 1.928C70.8424 2.016 70.8664 2.104 70.8904 2.192ZM71.1664 3.344L66.0904 2.804H71.0344L71.1664 3.344ZM71.1424 4.484L66.2104 3.956H71.3224L71.3584 4.112L71.1424 4.484ZM70.4824 5.624L65.6104 5.108H70.7824L70.4824 5.624ZM69.8224 6.776L64.9504 6.26H70.1224L69.8224 6.776ZM69.1504 7.94L64.2664 7.424H69.4504L69.1504 7.94Z" fill="currentColor"/>
            </svg>
          </a>
        </div>
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
    const initialQuestionsHtml =
      this.config.initialQuestions && this.config.initialQuestions.length > 0
        ? `<div class="querybox-chat__suggested-questions">
          ${this.config.initialQuestions
            .map(
              (question, index) => `
            <button class="querybox-chat__suggested-question" data-question-index="${index}">
              ${this.escapeHtml(question)}
            </button>
          `
            )
            .join("")}
        </div>`
        : "";

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
        <div class="querybox-chat__input-container">
          ${initialQuestionsHtml}
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

    // Suggested question buttons
    const initialQuestions = panel.querySelectorAll(
      ".querybox-chat__suggested-question"
    );
    initialQuestions.forEach((button) => {
      button.addEventListener("click", () => {
        const index = parseInt(
          button.getAttribute("data-question-index") || "0"
        );
        const question = this.config.initialQuestions?.[index];
        if (question && this.chatInput) {
          this.chatInput.value = question;
          this.handleSend();
        }
      });
    });
  }

  /**
   * Switch to a specific mode
   */
  public switchToMode(mode: PanelMode): void {
    if (mode === this.currentMode) return;

    this.currentMode = mode;
    this.showMode(mode);
    this.updateModeButtons();
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
        const response = await this.searchClient.search(query);
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
      ${
        result.url
          ? `<a href="${this.escapeHtml(
              result.url
            )}" class="querybox-search__result" target="_blank" rel="noopener noreferrer">
          <h3 class="querybox-search__result-title">${this.sanitizeWithHighlights(
            result.title
          )}</h3>
          <p class="querybox-search__result-content">${this.sanitizeWithHighlights(
            result.content
          )}</p>
          <span class="querybox-search__result-link">View →</span>
        </a>`
          : `<div class="querybox-search__result">
          <h3 class="querybox-search__result-title">${this.sanitizeWithHighlights(
            result.title
          )}</h3>
          <p class="querybox-search__result-content">${this.sanitizeWithHighlights(
            result.content
          )}</p>
        </div>`
      }
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
          // Clear transient content when first real text arrives
          if (
            !message.content &&
            (message.thinking?.length || message.toolCalls?.length)
          ) {
            message.thinking = [];
            message.toolCalls = [];
          }

          message.content += chunk.content;
          this.updateStreamingMessage(messageId);
        }
        break;

      case "thinking":
        if (chunk.thinking) {
          // Only show progress text if no content yet
          if (!message.content) {
            message.thinking = message.thinking || [];
            // Replace with latest progress message (don't accumulate)
            message.thinking = [chunk.thinking];
            this.updateStreamingMessage(messageId);
          }
        }
        break;

      case "tool_call":
        // Don't render tool calls - just ignore them
        break;

      case "tool_result":
        // Don't render tool results - just ignore them
        break;

      case "error":
        if (chunk.error) {
          message.content = `Error: ${chunk.error}`;
          // Clear transient content on error
          message.thinking = [];
          message.toolCalls = [];
          this.renderMessages();
        }
        break;

      case "done":
        // Clear transient content when done if we have actual content
        if (message.content) {
          message.thinking = [];
          message.toolCalls = [];
          this.updateStreamingMessage(messageId);
        }
        break;
    }
  }

  /**
   * Update only the streaming message without re-rendering everything
   */
  private updateStreamingMessage(messageId: string): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return;

    const messageElement = this.messageElements.get(messageId);
    if (!messageElement) return;

    const contentContainer = messageElement.querySelector(
      ".querybox-chat__message-content"
    );
    if (!contentContainer) return;

    // Build the updated content
    let html = "";

    // Progress text
    if (message.thinking && message.thinking.length > 0) {
      html += `<div class="querybox-chat__progress">${this.escapeHtml(
        message.thinking[0].content
      )}</div>`;
    }

    // Main content
    if (message.content) {
      try {
        const rawHtml = marked.parse(message.content, {
          async: false,
        }) as string;
        html += `<div class="querybox-chat__markdown">${this.sanitizeMarkdown(
          rawHtml
        )}</div>`;
      } catch (error) {
        console.error("Failed to parse markdown:", error);
        html += `<p>${this.escapeHtml(message.content)}</p>`;
      }
    } else if (!message.thinking || message.thinking.length === 0) {
      html += '<div class="querybox-spinner"></div>';
    }

    contentContainer.innerHTML = html;

    // Auto-scroll to bottom
    const messagesContainer = this.panel?.querySelector(
      ".querybox-chat__messages"
    );
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
      this.messageElements.clear();

      // Show initial questions when no messages
      this.showInitialQuestions();
      return;
    }

    // Hide initial questions when there are messages
    this.hideInitialQuestions();

    // Only render new messages, keep existing ones
    this.messages.forEach((message) => {
      if (!this.messageElements.has(message.id)) {
        const messageEl = document.createElement("div");
        messageEl.className = `querybox-chat__message querybox-chat__message--${message.role}`;
        messageEl.dataset.messageId = message.id;

        const contentEl = document.createElement("div");
        contentEl.className = "querybox-chat__message-content";

        // Initial content
        if (message.role === "assistant" && !message.content) {
          contentEl.innerHTML = '<div class="querybox-spinner"></div>';
        } else if (message.content) {
          contentEl.innerHTML = `<p>${this.escapeHtml(message.content)}</p>`;
        }

        messageEl.appendChild(contentEl);
        messagesContainer.appendChild(messageEl);
        this.messageElements.set(message.id, messageEl);
      }
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Show initial questions
   */
  private showInitialQuestions(): void {
    const questionsContainer = this.panel?.querySelector(
      ".querybox-chat__suggested-questions"
    );
    if (questionsContainer) {
      (questionsContainer as HTMLElement).style.display = "flex";
    }
  }

  /**
   * Hide initial questions
   */
  private hideInitialQuestions(): void {
    const questionsContainer = this.panel?.querySelector(
      ".querybox-chat__suggested-questions"
    );
    if (questionsContainer) {
      (questionsContainer as HTMLElement).style.display = "none";
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sanitize HTML but allow <em> tags for highlighting
   * Escapes all HTML first, then restores only <em> and </em> tags
   */
  private sanitizeWithHighlights(text: string): string {
    // First escape all HTML to prevent XSS
    const escaped = this.escapeHtml(text);
    // Then restore only <em> and </em> tags for highlighting
    return escaped
      .replace(/&lt;em&gt;/g, "<em>")
      .replace(/&lt;\/em&gt;/g, "</em>");
  }

  /**
   * Sanitize markdown HTML while allowing safe markdown elements
   * Uses DOMParser to parse and filter HTML safely
   */
  private sanitizeMarkdown(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Allowed tags for markdown
    const allowedTags = new Set([
      "P",
      "BR",
      "STRONG",
      "EM",
      "U",
      "CODE",
      "PRE",
      "A",
      "UL",
      "OL",
      "LI",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "BLOCKQUOTE",
      "HR",
      "TABLE",
      "THEAD",
      "TBODY",
      "TR",
      "TH",
      "TD",
    ]);

    // Recursively clean nodes
    const cleanNode = (node: Node): Node | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode(true);
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // Check if tag is allowed
        if (!allowedTags.has(element.tagName)) {
          return null;
        }

        const cleaned = document.createElement(element.tagName);

        // Copy safe attributes
        if (element.tagName === "A") {
          const href = element.getAttribute("href");
          if (
            href &&
            (href.startsWith("http://") || href.startsWith("https://"))
          ) {
            cleaned.setAttribute("href", href);
            cleaned.setAttribute("target", "_blank");
            cleaned.setAttribute("rel", "noopener noreferrer");
          }
        }

        // Clean children
        Array.from(element.childNodes).forEach((child) => {
          const cleanedChild = cleanNode(child);
          if (cleanedChild) {
            cleaned.appendChild(cleanedChild);
          }
        });

        return cleaned;
      }

      return null;
    };

    const cleanedBody = document.createElement("div");
    Array.from(doc.body.childNodes).forEach((child) => {
      const cleanedChild = cleanNode(child);
      if (cleanedChild) {
        cleanedBody.appendChild(cleanedChild);
      }
    });

    return cleanedBody.innerHTML;
  }

  protected onOpen(): void {
    this.focusInput();
  }

  public destroy(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.messages = [];
    this.messageElements.clear();
    super.destroy();
  }
}
