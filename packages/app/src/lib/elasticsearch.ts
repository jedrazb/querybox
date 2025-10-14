/**
 * Elasticsearch client for backend API
 * Handles all ES operations with server-side credentials
 */

import type {
  SearchRequest,
  SearchResponse,
  SearchResult,
  DomainConfig,
  ElasticsearchSearchResponse,
} from "@jedrazb/querybox-shared";

export class ElasticsearchClient {
  private host: string;
  private apiKey: string;

  constructor() {
    this.host = process.env.ELASTICSEARCH_HOST || "";
    this.apiKey = process.env.API_KEY || "";

    if (!this.host || !this.apiKey) {
      throw new Error(
        "Missing Elasticsearch credentials in environment variables"
      );
    }
  }

  /**
   * Perform search against a domain's index
   */
  async search(
    indexName: string,
    request: SearchRequest
  ): Promise<SearchResponse> {
    const { query, size = 10, from = 0 } = request;

    const searchBody = {
      query: {
        multi_match: {
          query,
          fields: ["title^3", "content", "metadata.*"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
      size,
      from,
      highlight: {
        fields: {
          title: {},
          content: { fragment_size: 150, number_of_fragments: 3 },
        },
      },
    };

    const response = await this.makeRequest<ElasticsearchSearchResponse>(
      `/${indexName}/_search`,
      {
        method: "POST",
        body: JSON.stringify(searchBody),
      }
    );

    const results: SearchResult[] = response.hits.hits.map((hit) => ({
      id: hit._id,
      title: (hit._source.title as string) || "",
      content: (hit._source.content as string) || "",
      url: hit._source.url as string | undefined,
      score: hit._score,
      metadata: hit._source.metadata as Record<string, unknown> | undefined,
    }));

    return {
      results,
      total: response.hits.total.value,
      took: response.took,
    };
  }

  /**
   * Get domain configuration from the config index
   */
  async getDomainConfig(domain: string): Promise<DomainConfig | null> {
    try {
      const response = await this.makeRequest<{ _source: DomainConfig }>(
        `/querybox_configs/_doc/${domain}`,
        { method: "GET" }
      );
      return response._source;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save or update domain configuration
   */
  async saveDomainConfig(config: DomainConfig): Promise<void> {
    await this.makeRequest(`/querybox_configs/_doc/${config.domain}`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }

  /**
   * Create index with proper mappings
   */
  async createIndex(indexName: string): Promise<void> {
    const mappings = {
      mappings: {
        properties: {
          title: { type: "text", analyzer: "standard" },
          content: { type: "text", analyzer: "standard" },
          url: { type: "keyword" },
          domain: { type: "keyword" },
          crawledAt: { type: "date" },
          metadata: { type: "object", enabled: true },
        },
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
      },
    };

    await this.makeRequest(`/${indexName}`, {
      method: "PUT",
      body: JSON.stringify(mappings),
    });
  }

  /**
   * Check if index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      await this.makeRequest(`/${indexName}`, { method: "HEAD" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get document count for an index
   */
  async getDocumentCount(indexName: string): Promise<number> {
    try {
      const response = await this.makeRequest<{ count: number }>(
        `/${indexName}/_count`,
        { method: "GET" }
      );
      return response.count;
    } catch {
      return 0;
    }
  }

  /**
   * Index a document
   */
  async indexDocument(
    indexName: string,
    id: string,
    document: Record<string, unknown>
  ): Promise<void> {
    await this.makeRequest(`/${indexName}/_doc/${id}`, {
      method: "PUT",
      body: JSON.stringify(document),
    });
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(
    indexName: string,
    documents: Array<{ id: string; doc: Record<string, unknown> }>
  ): Promise<void> {
    const bulkBody = documents.flatMap((doc) => [
      { index: { _index: indexName, _id: doc.id } },
      doc.doc,
    ]);

    await this.makeRequest("/_bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-ndjson",
      },
      body: bulkBody.map((line) => JSON.stringify(line)).join("\n") + "\n",
    });
  }

  /**
   * Make request to Elasticsearch
   */
  private async makeRequest<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.host}${path}`;
    const headers = {
      Authorization: `ApiKey ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: any = new Error(
        `Elasticsearch request failed: ${response.statusText}`
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  }
}

// Singleton instance
let esClient: ElasticsearchClient | null = null;

export function getElasticsearchClient(): ElasticsearchClient {
  if (!esClient) {
    esClient = new ElasticsearchClient();
  }
  return esClient;
}
