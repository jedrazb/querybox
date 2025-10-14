/**
 * Shared types and interfaces for QueryBox widget and API
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * QueryBox website URL
 */
export const QUERYBOX_WEBSITE_URL = "https://querybox.io";

// ============================================================================
// Widget Configuration
// ============================================================================

/**
 * Configuration options for QueryBox widget
 * Now simplified - widget only needs API endpoint
 */
export interface QueryBoxConfig {
  /** API endpoint for QueryBox backend (e.g., https://api.querybox.io/api/querybox/yourdomain.com/v1) */
  apiEndpoint: string;
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
 * Domain configuration stored in Elasticsearch
 */
export interface DomainConfig {
  domain: string;
  indexName: string;
  agentId?: string;
  createdAt: number;
  updatedAt: number;
  status: "active" | "crawling" | "error" | "pending";
  crawlConfig?: CrawlConfig;
}

/**
 * Crawl configuration
 */
export interface CrawlConfig {
  startUrl: string;
  maxPages?: number;
  allowedDomains?: string[];
  excludePatterns?: string[];
  crawlDepth?: number;
}

/**
 * Crawl request
 */
export interface CrawlRequest {
  domain: string;
  config: CrawlConfig;
}

/**
 * Crawl status response
 */
export interface CrawlStatus {
  domain: string;
  status: "pending" | "crawling" | "completed" | "error";
  progress?: {
    pagesProcessed: number;
    totalPages: number;
  };
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

/**
 * Domain status response
 */
export interface DomainStatus {
  domain: string;
  configured: boolean;
  indexName?: string;
  agentId?: string;
  status?: "active" | "crawling" | "error" | "pending";
  documentCount?: number;
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
