/**
 * Elasticsearch client for backend API
 * Handles all ES operations with server-side credentials
 */

import { Client } from "@elastic/elasticsearch";
import type {
  SearchRequest,
  SearchResponse,
  SearchResult,
  DomainConfig,
} from "@jedrazb/querybox-shared";

export class ElasticsearchClient {
  private client: Client;

  constructor() {
    const host = process.env.ELASTICSEARCH_HOST || "";
    const apiKey = process.env.API_KEY || "";

    if (!host || !apiKey) {
      throw new Error(
        "Missing Elasticsearch credentials in environment variables"
      );
    }

    this.client = new Client({
      node: host,
      auth: {
        apiKey: apiKey,
      },
    });
  }

  /**
   * Perform search against a domain's index
   */
  async search(
    indexName: string,
    request: SearchRequest
  ): Promise<SearchResponse> {
    const { query, size = 10, from = 0 } = request;

    const response = await this.client.search({
      index: indexName,
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
    });

    const results: SearchResult[] = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      title: (hit._source.title as string) || "",
      content: (hit._source.content as string) || "",
      url: hit._source.url as string | undefined,
      score: hit._score,
      metadata: hit._source.metadata as Record<string, unknown> | undefined,
    }));

    return {
      results,
      total:
        typeof response.hits.total === "number"
          ? response.hits.total
          : response.hits.total?.value || 0,
      took: response.took,
    };
  }

  /**
   * Get domain configuration from the config index
   */
  async getDomainConfig(domain: string): Promise<DomainConfig | null> {
    try {
      const response = await this.client.get<DomainConfig>({
        index: "querybox-config",
        id: domain,
      });
      return response._source || null;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save or update domain configuration
   */
  async saveDomainConfig(config: DomainConfig): Promise<void> {
    await this.client.index({
      index: "querybox-config",
      id: config.domain,
      document: config,
    });
  }

  /**
   * Create index with proper mappings
   */
  async createCrawlerIndex(indexName: string): Promise<void> {
    await this.client.indices.create({
      index: indexName,
      mappings: {
        properties: {
          title: {
            type: "text",
            copy_to: "semantic_body",
          },
          body: {
            type: "text",
            copy_to: "semantic_body",
          },
          semantic_text: {
            type: "semantic_text",
            inference_id: ".elser-2-elasticsearch",
          },
        },
      },
    });
  }

  /**
   * Check if index exists
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      return await this.client.indices.exists({ index: indexName });
    } catch {
      return false;
    }
  }

  /**
   * Get document count for an index
   */
  async getDocumentCount(indexName: string): Promise<number> {
    try {
      const response = await this.client.count({ index: indexName });
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
    await this.client.index({
      index: indexName,
      id: id,
      document: document,
    });
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(
    indexName: string,
    documents: Array<{ id: string; doc: Record<string, unknown> }>
  ): Promise<void> {
    const operations = documents.flatMap((doc) => [
      { index: { _index: indexName, _id: doc.id } },
      doc.doc,
    ]);

    await this.client.bulk({ operations });
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
