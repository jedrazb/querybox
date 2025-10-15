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
   * Perform hybrid search against a domain's index
   * Combines semantic search (ELSER) with traditional text search
   */
  async search(
    indexName: string,
    request: SearchRequest
  ): Promise<SearchResponse> {
    const { query, size = 10, from = 0 } = request;

    const response = await this.client.search({
      index: indexName,
      size,
      from,
      query: {
        bool: {
          must: [
            // Semantic search using ELSER
            {
              match: {
                semantic_text: {
                  query,
                  boost: 2,
                },
              },
            },
            // Traditional keyword search
            {
              multi_match: {
                query,
                fields: ["title^3", "headings^2", "body"],
                type: "best_fields",
                fuzziness: "AUTO",
                boost: 1,
              },
            },
          ],
        },
      },
      highlight: {
        pre_tags: ["<em>"],
        post_tags: ["</em>"],
        fields: {
          title: {
            number_of_fragments: 0, // Return entire title if matched
          },
          headings: {
            fragment_size: 100,
            number_of_fragments: 2,
          },
          body: {
            fragment_size: 200,
            number_of_fragments: 3,
            fragmenter: "span", // Better for preserving sentence structure
          },
        },
      },
    });

    const results: SearchResult[] = response.hits.hits.map((hit: any) => {
      // Extract highlighted fragments
      const highlight = hit.highlight || {};

      // Use highlighted title if available, otherwise use original
      const title = highlight.title?.[0] || hit._source.title || "";

      // Combine body fragments with ellipsis, or fall back to truncated body
      let content = "";
      if (highlight.body && highlight.body.length > 0) {
        content = highlight.body.join(" ... ");
      } else if (highlight.headings && highlight.headings.length > 0) {
        // If no body highlights, use heading highlights
        content = highlight.headings.join(" ... ");
      } else if (hit._source.body) {
        // Fall back to truncated body (first 500 chars)
        content =
          hit._source.body.substring(0, 500) +
          (hit._source.body.length > 500 ? "..." : "");
      } else if (hit._source.meta_description) {
        content = hit._source.meta_description;
      }

      return {
        id: hit._id,
        title,
        content,
        url: hit._source.url as string | undefined,
        score: hit._score,
        metadata: {
          headings: hit._source.headings,
          meta_description: hit._source.meta_description,
          highlighted_title: highlight.title?.[0], // Include highlighted version with tags
          highlighted_body: highlight.body,
          highlighted_headings: highlight.headings,
          ...hit._source.metadata,
        } as Record<string, unknown> | undefined,
      };
    });

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
   * Create index with proper mappings for hybrid search
   */
  async createCrawlerIndex(indexName: string): Promise<void> {
    await this.client.indices.create({
      index: indexName,
      mappings: {
        properties: {
          title: {
            type: "text",
            copy_to: "semantic_text",
          },
          headings: {
            type: "text",
          },
          body: {
            type: "text",
            copy_to: "semantic_text",
          },
          semantic_text: {
            type: "semantic_text",
            inference_id: ".elser-2-elasticsearch",
          },
          url: {
            type: "text",
            fields: {
              keyword: {
                type: "keyword",
                ignore_above: 256,
              },
            },
          },
          meta_description: {
            type: "text",
          },
          last_crawled_at: {
            type: "date",
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
