import type { ChatChunk, ChatRequest } from "@jedrazb/querybox-shared";

/**
 * Chat client that communicates with QueryBox backend API using SSE
 */
export class ChatClient {
  private apiEndpoint: string;
  private conversationId: string | null = null;
  private eventSource: EventSource | null = null;

  constructor(apiEndpoint: string) {
    // Remove trailing slash if present
    this.apiEndpoint = apiEndpoint.replace(/\/$/, "");
  }

  /**
   * Send a message and get streaming response via SSE
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

      // Log conversation continuity
      if (this.conversationId) {
        console.log(
          `[QueryBox] Continuing conversation: ${this.conversationId}`
        );
      } else {
        console.log("[QueryBox] Starting new conversation");
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
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

      // Check if response is SSE stream
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/event-stream")) {
        await this.handleStreamResponse(response, onChunk);
      } else {
        // Fallback to JSON response for backward compatibility
        await this.handleJsonResponse(response, onChunk);
      }
    } catch (error) {
      console.error("Chat client error:", error);
      throw error;
    }
  }

  /**
   * Handle SSE stream response
   */
  private async handleStreamResponse(
    response: Response,
    onChunk: (chunk: ChatChunk) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = line.slice(6); // Remove "data: " prefix
              const chunk: ChatChunk = JSON.parse(data);

              // Update conversation ID if provided in the chunk
              if (chunk.conversationId && !this.conversationId) {
                this.conversationId = chunk.conversationId;
                console.log(
                  `[QueryBox] Conversation ID received: ${this.conversationId}`
                );
                console.log(
                  "[QueryBox] Future messages will continue this conversation"
                );
              }

              onChunk(chunk);

              if (chunk.type === "done" || chunk.type === "error") {
                return;
              }
            } catch (error) {
              console.error("Failed to parse SSE message:", error, line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Handle JSON response from backend (fallback for backward compatibility)
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
   * Cancel current request if any
   */
  cancel(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
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
