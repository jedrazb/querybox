import type { ChatChunk } from "../types";

export interface ChatClientConfig {
  host: string;
  apiKey: string;
  agentId: string;
}

/**
 * Chat client for agent converse API with streaming support
 */
export class ChatClient {
  private config: ChatClientConfig;
  private conversationId: string | null = null;

  constructor(config: ChatClientConfig) {
    this.config = config;
  }

  /**
   * Send a message and stream the response
   * @param message - The user message
   * @param onChunk - Callback for each chunk received
   */
  async sendMessage(
    message: string,
    onChunk: (chunk: ChatChunk) => void
  ): Promise<void> {
    const url = `${this.config.host}/api/agents/${this.config.agentId}/converse`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          message,
          conversation_id: this.conversationId,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      // Check if the response is streaming
      const contentType = response.headers.get("content-type");
      if (
        contentType?.includes("text/event-stream") ||
        contentType?.includes("application/x-ndjson")
      ) {
        await this.handleStreamingResponse(response, onChunk);
      } else {
        await this.handleJsonResponse(response, onChunk);
      }
    } catch (error) {
      console.error("Chat client error:", error);
      throw error;
    }
  }

  /**
   * Handle streaming response (SSE or NDJSON)
   */
  private async handleStreamingResponse(
    response: Response,
    onChunk: (chunk: ChatChunk) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onChunk({ type: "done" });
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          // Handle SSE format
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            if (data === "[DONE]") {
              onChunk({ type: "done" });
              continue;
            }
            this.parseAndEmitChunk(data, onChunk);
          } else {
            // Handle NDJSON format
            this.parseAndEmitChunk(line, onChunk);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Handle non-streaming JSON response
   */
  private async handleJsonResponse(
    response: Response,
    onChunk: (chunk: ChatChunk) => void
  ): Promise<void> {
    const data = await response.json();

    // Update conversation ID if provided
    if (data.conversation_id) {
      this.conversationId = data.conversation_id;
    }

    // Emit the complete message as chunks
    if (data.content) {
      onChunk({
        type: "text",
        content: data.content,
        messageId: data.message_id,
      });
    }

    // Emit tool calls if present
    if (data.tool_calls && Array.isArray(data.tool_calls)) {
      for (const toolCall of data.tool_calls) {
        onChunk({
          type: "tool_call",
          toolCall: {
            id: toolCall.id,
            name: toolCall.name,
            arguments: toolCall.arguments,
            result: toolCall.result,
          },
        });

        if (toolCall.result) {
          onChunk({
            type: "tool_result",
            toolCall: {
              id: toolCall.id,
              name: toolCall.name,
              arguments: toolCall.arguments,
              result: toolCall.result,
            },
          });
        }
      }
    }

    onChunk({ type: "done" });
  }

  /**
   * Parse and emit a chunk
   */
  private parseAndEmitChunk(
    data: string,
    onChunk: (chunk: ChatChunk) => void
  ): void {
    try {
      const parsed = JSON.parse(data);

      // Update conversation ID if provided
      if (parsed.conversation_id) {
        this.conversationId = parsed.conversation_id;
      }

      // Handle different chunk types based on the API response structure
      if (parsed.type === "content" || parsed.delta?.content) {
        onChunk({
          type: "text",
          content: parsed.content || parsed.delta.content,
          messageId: parsed.message_id,
        });
      } else if (parsed.type === "tool_call" || parsed.delta?.tool_calls) {
        const toolCall = parsed.tool_call || parsed.delta.tool_calls?.[0];
        if (toolCall) {
          onChunk({
            type: "tool_call",
            toolCall: {
              id: toolCall.id,
              name: toolCall.name || toolCall.function?.name,
              arguments:
                toolCall.arguments || toolCall.function?.arguments || {},
            },
          });
        }
      } else if (parsed.type === "tool_result") {
        onChunk({
          type: "tool_result",
          toolCall: {
            id: parsed.tool_call_id,
            name: parsed.tool_name,
            arguments: {},
            result: parsed.result,
          },
        });
      } else if (parsed.type === "done" || parsed.finish_reason) {
        onChunk({ type: "done" });
      }
    } catch (error) {
      console.error("Error parsing chunk:", error, data);
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
