/**
 * Configuration options for QueryBox widget
 */
export interface QueryBoxConfig {
  /** Host URL for the API (required) */
  host: string;
  /** API Key for authentication (required) */
  apiKey: string;
  /** Elasticsearch index name with crawled website content (required) */
  indexName: string;
  /** Optional agent ID for chat functionality */
  agentId?: string;
  /** Container element or selector */
  container?: HTMLElement | string;
  /** Theme configuration */
  theme?: "light" | "dark" | "auto";
  /** Custom CSS class names */
  classNames?: Partial<{
    panel: string;
    searchPanel: string;
    chatPanel: string;
    overlay: string;
  }>;
}

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  url?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Search response from Elasticsearch
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

/**
 * Tool call information
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

/**
 * Chat response chunk (for streaming)
 */
export interface ChatChunk {
  type: "text" | "tool_call" | "tool_result" | "done";
  content?: string;
  toolCall?: ToolCall;
  messageId?: string;
}
