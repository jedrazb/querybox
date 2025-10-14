import type { ChatChunk, ChatRequest } from "@jedrazb/querybox-shared";

/**
 * Chat client that communicates with QueryBox backend API
 */
export class ChatClient {
  private apiEndpoint: string;
  private conversationId: string | null = null;

  constructor(apiEndpoint: string) {
    // Remove trailing slash if present
    this.apiEndpoint = apiEndpoint.replace(/\/$/, "");
  }

  /**
   * Send a message and get response
   * @param message - The user message
   * @param onChunk - Callback for each chunk received
   */
  async sendMessage(
    message: string,
    onChunk: (chunk: ChatChunk) => void
  ): Promise<void> {
    const url = `${this.apiEndpoint}/chat`;

    try {
      const chatRequest: ChatRequest = {
        message,
        conversationId: this.conversationId || undefined,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Chat API error: ${error.error || response.statusText}`
        );
      }

      // For now, handle simple JSON response (can add streaming later)
      await this.handleJsonResponse(response, onChunk);
    } catch (error) {
      console.error("Chat client error:", error);
      throw error;
    }
  }

  /**
   * Handle JSON response from backend
   */
  private async handleJsonResponse(
    response: Response,
    onChunk: (chunk: ChatChunk) => void
  ): Promise<void> {
    const data = await response.json();

    // Update conversation ID if provided
    if (data.conversationId) {
      this.conversationId = data.conversationId;
    }

    // Emit the message
    if (data.message) {
      const msg = data.message;

      if (msg.content) {
        onChunk({
          type: "text",
          content: msg.content,
          messageId: msg.id,
        });
      }

      // Emit tool calls if present
      if (msg.toolCalls && Array.isArray(msg.toolCalls)) {
        for (const toolCall of msg.toolCalls) {
          onChunk({
            type: "tool_call",
            toolCall,
          });

          if (toolCall.result) {
            onChunk({
              type: "tool_result",
              toolCall,
            });
          }
        }
      }
    }

    onChunk({ type: "done" });
  }

  /**
   * Reset the conversation
   */
  resetConversation(): void {
    this.conversationId = null;
  }

  /**
   * Get the current conversation ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }
}
