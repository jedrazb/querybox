import type { SearchResponse, SearchRequest } from "@jedrazb/querybox-shared";

/**
 * Search client that communicates with QueryBox backend API
 */
export class SearchClient {
  private apiEndpoint: string;

  constructor(apiEndpoint: string) {
    // Remove trailing slash if present
    this.apiEndpoint = apiEndpoint.replace(/\/$/, "");
  }

  /**
   * Perform a search query via backend API
   * @param query - The search query string
   * @param options - Additional search options
   * @param signal - Optional AbortSignal to cancel the request
   */
  async search(
    query: string,
    options?: {
      size?: number;
      from?: number;
    },
    signal?: AbortSignal
  ): Promise<SearchResponse> {
    const size = options?.size || 10;
    const from = options?.from || 0;

    try {
      const searchRequest: SearchRequest = {
        query,
        size,
        from,
      };

      const response = await fetch(`${this.apiEndpoint}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchRequest),
        signal, // Pass abort signal to fetch
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Search API error: ${error.error || response.statusText}`
        );
      }

      const data: SearchResponse = await response.json();
      return data;
    } catch (error) {
      // Don't log aborted requests as errors
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Search error:", error);
      }
      throw error;
    }
  }
}
