import { BasePanel } from "./BasePanel";
import { ChatClient } from "../api/chat-client";
import type {
  QueryBoxConfig,
  ChatMessage,
  ChatChunk,
} from "@jedrazb/querybox-shared";

/**
 * Chat panel component
 */
export class ChatPanel extends BasePanel {
  private chatInput: HTMLInputElement | null = null;
  private messagesContainer: HTMLElement | null = null;
  private chatClient: ChatClient;
  private messages: ChatMessage[] = [];

  constructor(config: Required<QueryBoxConfig>, container: HTMLElement) {
    super(config, container);
    this.chatClient = new ChatClient(config.apiEndpoint);
  }

  protected createPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = `querybox-panel querybox-chat-panel ${
      this.config.classNames.chatPanel || ""
    }`;

    panel.innerHTML = `
      <div class="querybox-panel__header">
        <h2 class="querybox-panel__title">Chat Assistant</h2>
        <button class="querybox-panel__close" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
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
    `;

    // Set up event listeners
    this.chatInput = panel.querySelector(".querybox-chat__input");
    this.messagesContainer = panel.querySelector(".querybox-chat__messages");

    const closeButton = panel.querySelector(".querybox-panel__close");
    closeButton?.addEventListener("click", () => this.close());

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

    return panel;
  }

  /**
   * Handle sending a message
   */
  private async handleSend(): Promise<void> {
    if (!this.chatInput || !this.messagesContainer) return;

    const message = this.chatInput.value.trim();
    if (!message) return;

    // Clear input
    this.chatInput.value = "";

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    this.addMessage(userMessage);

    // Create assistant message placeholder
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
      // Stream the response
      await this.chatClient.sendMessage(message, (chunk: ChatChunk) => {
        this.handleChatChunk(assistantMessageId, chunk);
      });
    } catch (error) {
      this.handleChatError(assistantMessageId, error as Error);
    }
  }

  /**
   * Handle incoming chat chunks
   */
  private handleChatChunk(messageId: string, chunk: ChatChunk): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return;

    switch (chunk.type) {
      case "text":
        if (chunk.content) {
          message.content += chunk.content;
          this.updateMessage(messageId);
        }
        break;

      case "tool_call":
        if (chunk.toolCall) {
          message.toolCalls = message.toolCalls || [];
          message.toolCalls.push(chunk.toolCall);
          this.updateMessage(messageId);
        }
        break;

      case "tool_result":
        if (chunk.toolCall) {
          const toolCall = message.toolCalls?.find(
            (tc) => tc.id === chunk.toolCall!.id
          );
          if (toolCall) {
            toolCall.result = chunk.toolCall.result;
            this.updateMessage(messageId);
          }
        }
        break;

      case "done":
        // Message complete
        break;
    }
  }

  /**
   * Handle chat error
   */
  private handleChatError(messageId: string, error: Error): void {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return;

    message.content = `Sorry, an error occurred: ${error.message}`;
    this.updateMessage(messageId);
  }

  /**
   * Add a message to the chat
   */
  private addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.renderMessages();
  }

  /**
   * Update an existing message
   */
  private updateMessage(_messageId: string): void {
    this.renderMessages();
  }

  /**
   * Render all messages
   */
  private renderMessages(): void {
    if (!this.messagesContainer) return;

    if (this.messages.length === 0) {
      this.messagesContainer.innerHTML = `
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

    this.messagesContainer.innerHTML = messagesHtml;

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
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
    // Focus the chat input when opened
    setTimeout(() => {
      this.chatInput?.focus();
    }, 100);
  }

  public destroy(): void {
    this.messages = [];
    super.destroy();
  }
}
