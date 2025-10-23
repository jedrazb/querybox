/**
 * Shared types and interfaces for QueryBox widget and API
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * QueryBox website URL
 */
export const QUERYBOX_WEBSITE_URL = "https://www.querybox.dev";

// ============================================================================
// Widget Configuration
// ============================================================================

/**
 * Configuration options for QueryBox widget
 * Now simplified - widget only needs API endpoint
 */
export interface QueryBoxConfig {
  /** API endpoint for QueryBox backend (e.g., /api/yourdomain.com/v1) */
  apiEndpoint: string;
  /** Container element or selector */
  container?: HTMLElement | string;
  /** Theme configuration */
  theme?: "light" | "dark" | "auto";
  /** Primary color for the widget (e.g., '#ec4899') */
  primaryColor?: string;
  /** Optional title to display at the top of the QueryBox panel */
  title?: string;
  /** Suggested questions to display in empty chat state (max 3) */
  initialQuestions?: string[];
  /** Custom CSS class names */
  classNames?: Partial<{
    panel: string;
    searchPanel: string;
    chatPanel: string;
    overlay: string;
  }>;
}

// ============================================================================
// Search Types
// ============================================================================

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
 * Search response from API
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number;
}

/**
 * Search request to API
 */
export interface SearchRequest {
  query: string;
  size?: number;
  from?: number;
}

// ============================================================================
// Chat Types
// ============================================================================

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  thinking?: ThinkingUpdate[];
}

/**
 * Tool call information
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status?: "running" | "completed" | "error";
}

/**
 * Thinking/reasoning update
 */
export interface ThinkingUpdate {
  id: string;
  content: string;
  timestamp: number;
}

/**
 * Chat response chunk (for streaming)
 */
export interface ChatChunk {
  type: "text" | "tool_call" | "tool_result" | "thinking" | "done" | "error";
  content?: string;
  toolCall?: ToolCall;
  thinking?: ThinkingUpdate;
  messageId?: string;
  conversationId?: string;
  error?: string;
}

/**
 * Chat request to API
 */
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

// ============================================================================
// Backend API Types (for API package)
// ============================================================================

/**
 * Domain configuration stored in Elasticsearch
 */
export interface DomainConfig {
  domain: string;
  indexName: string;
  agentId?: string;
  createdAt: number;
  updatedAt: number;
  crawlExecutionId?: string;
}
