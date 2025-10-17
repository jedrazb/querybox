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

/**
 * Chat response from API
 */
export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
}

// ============================================================================
// Backend API Types (for API package)
// ============================================================================

/**
 * Crawl configuration
 */
export interface CrawlConfig {
  startUrl: string;
  maxPages?: number;
  crawlDepth?: number;
}

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
  crawlConfig?: CrawlConfig;
}

// ============================================================================
// Elasticsearch Types (for API backend)
// ============================================================================

/**
 * Elasticsearch hit
 */
export interface ElasticsearchHit {
  _index: string;
  _id: string;
  _score: number;
  _source: Record<string, unknown>;
}

/**
 * Elasticsearch search response
 */
export interface ElasticsearchSearchResponse {
  took: number;
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: ElasticsearchHit[];
  };
}

/**
 * Crawler document structure
 * Represents a document indexed by the Elastic web crawler
 */
export interface CrawlerDocument {
  /** Main body content of the page */
  body?: string;
  /** Page headings */
  headings?: string;
  /** Document ID */
  id?: string;
  /** Timestamp of last crawl */
  last_crawled_at?: string;
  /** Links found on the page */
  links?: string;
  /** Meta description tag content */
  meta_description?: string;
  /** Combined semantic field (title + body) */
  semantic_body?: string;
  /** ELSER semantic text field for semantic search */
  semantic_text?: string;
  /** Page title */
  title?: string;
  /** Full URL of the page */
  url?: string;
  /** URL host component */
  url_host?: string;
  /** URL path component */
  url_path?: string;
  /** First directory in URL path */
  url_path_dir1?: string;
  /** Second directory in URL path */
  url_path_dir2?: string;
  /** Third directory in URL path */
  url_path_dir3?: string;
  /** URL port number */
  url_port?: number;
  /** URL scheme (http/https) */
  url_scheme?: string;
}
