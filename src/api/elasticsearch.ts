import type { SearchResponse, SearchResult } from "../types";

/**
 * Elasticsearch client for search functionality
 */
export class ElasticsearchClient {
  private host: string;
  private apiKey: string;
  private indexName: string;

  constructor(host: string, apiKey: string, indexName: string) {
    this.host = host;
    this.apiKey = apiKey;
    this.indexName = indexName;
  }

  /**
   * Perform a search query
   * @param query - The search query string
   * @param options - Additional search options
   */
  async search(
    query: string,
    options?: {
      size?: number;
      from?: number;
      index?: string;
    }
  ): Promise<SearchResponse> {
    const size = options?.size || 10;
    const from = options?.from || 0;
    const index = options?.index || this.indexName;

    try {
      const response = await fetch(`${this.host}/${index}/_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${this.apiKey}`,
        },
        body: JSON.stringify({
          query: {
            multi_match: {
              query: query,
              fields: ["title^2", "content", "description"],
              type: "best_fields",
              fuzziness: "AUTO",
            },
          },
          size,
          from,
          highlight: {
            fields: {
              content: {},
              title: {},
            },
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform Elasticsearch response to our format
      const results: SearchResult[] = data.hits.hits.map((hit: any) => ({
        id: hit._id,
        title: hit._source.title || "Untitled",
        content: this.extractContent(hit),
        url: hit._source.url,
        score: hit._score,
        metadata: {
          index: hit._index,
          type: hit._type,
          source: hit._source,
        },
      }));

      return {
        results,
        total:
          typeof data.hits.total === "object"
            ? data.hits.total.value
            : data.hits.total,
        took: data.took,
      };
    } catch (error) {
      console.error("Elasticsearch search error:", error);
      throw error;
    }
  }

  /**
   * Extract content from hit, preferring highlighted content
   */
  private extractContent(hit: any): string {
    // Use highlighted content if available
    if (hit.highlight) {
      if (hit.highlight.content) {
        return hit.highlight.content.join(" ... ");
      }
      if (hit.highlight.title) {
        return hit.highlight.title.join(" ... ");
      }
    }

    // Fall back to source content
    const content =
      hit._source.content || hit._source.description || hit._source.body || "";

    // Truncate if too long
    if (content.length > 300) {
      return content.substring(0, 297) + "...";
    }

    return content;
  }

  /**
   * Get suggestions/autocomplete
   * @param query - The partial query string
   */
  async suggest(
    query: string,
    options?: {
      field?: string;
      size?: number;
    }
  ): Promise<string[]> {
    const field = options?.field || "title.suggest";
    const size = options?.size || 5;

    try {
      const response = await fetch(`${this.host}/_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${this.apiKey}`,
        },
        body: JSON.stringify({
          suggest: {
            "title-suggestion": {
              prefix: query,
              completion: {
                field,
                size,
                skip_duplicates: true,
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.statusText}`);
      }

      const data = await response.json();
      const suggestions =
        data.suggest?.["title-suggestion"]?.[0]?.options || [];

      return suggestions.map((option: any) => option.text);
    } catch (error) {
      console.error("Elasticsearch suggest error:", error);
      return [];
    }
  }
}
