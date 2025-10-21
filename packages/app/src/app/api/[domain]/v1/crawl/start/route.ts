import { NextRequest, NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";
import { extractBaseDomain } from "@/lib/utils";
import {
  CRAWLER_USER_AGENT,
  MAX_CRAWL_DEPTH,
  MAX_CRAWL_URL_COUNT,
} from "@/app/constants";

/**
 * Discovers sitemap URLs for a domain by checking robots.txt and common locations
 */
async function discoverSitemaps(domain: string): Promise<string[]> {
  const sitemaps: string[] = [];
  const baseUrl = `https://${domain}`;

  try {
    // First, try to fetch robots.txt
    const robotsUrl = `${baseUrl}/robots.txt`;
    const robotsResponse = await fetch(robotsUrl, {
      method: "GET",
      headers: {
        "User-Agent": CRAWLER_USER_AGENT,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (robotsResponse.ok) {
      const robotsText = await robotsResponse.text();

      // Parse sitemap declarations from robots.txt
      // Format: Sitemap: https://example.com/sitemap.xml
      const sitemapRegex = /^Sitemap:\s*(.+)$/gim;
      let match;

      while ((match = sitemapRegex.exec(robotsText)) !== null) {
        const sitemapUrl = match[1].trim();
        if (sitemapUrl) {
          sitemaps.push(sitemapUrl);
        }
      }
    }
  } catch (error) {
    console.log(`Could not fetch robots.txt for ${domain}:`, error);
  }

  // If no sitemaps found in robots.txt, try common sitemap locations
  if (sitemaps.length === 0) {
    const commonSitemapPaths = [
      "/sitemap.xml",
      "/sitemap_index.xml",
      "/sitemap-index.xml",
    ];

    for (const path of commonSitemapPaths) {
      try {
        const sitemapUrl = `${baseUrl}${path}`;
        const response = await fetch(sitemapUrl, {
          method: "HEAD",
          headers: {
            "User-Agent": CRAWLER_USER_AGENT,
          },
          signal: AbortSignal.timeout(1000),
        });

        if (response.ok) {
          sitemaps.push(sitemapUrl);
          break; // Found one, that's enough
        }
      } catch (error) {
        // Silently continue to next path
      }
    }
  }

  return sitemaps;
}

/**
 * POST /{domain}/v1/crawl/start
 * Start async crawl via external crawler service
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = await params;

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    const baseDomain = extractBaseDomain(domain);

    // Get domain configuration
    const esClient = getElasticsearchClient();
    const config = await esClient.getDomainConfig(baseDomain);

    if (!config) {
      return NextResponse.json(
        { error: "Domain not configured" },
        { status: 404 }
      );
    }

    // Check if we have crawler environment variables
    const crawlerEndpoint = process.env.CRAWLER_ENDPOINT;
    const crawlerApiKey = process.env.CRAWLER_API_KEY;

    if (!crawlerEndpoint || !crawlerApiKey) {
      return NextResponse.json(
        { error: "Crawler service not configured" },
        { status: 500 }
      );
    }

    // Check if domain has a subdomain (e.g., blog.example.com vs example.com)
    const hasSubdomain = baseDomain.split(".").length > 2;

    // Discover sitemaps for the base domain
    const baseSitemaps = await discoverSitemaps(baseDomain);

    // Build domains array
    const domains = [
      {
        url: `https://${baseDomain}`,
        seed_urls: [`https://${baseDomain}`],
        ...(baseSitemaps.length > 0 && { sitemap_urls: baseSitemaps }),
      },
    ];

    const crawlConfig = {
      domains,
      user_agent: CRAWLER_USER_AGENT,
      max_crawl_depth: MAX_CRAWL_DEPTH,
      max_unique_url_count: MAX_CRAWL_URL_COUNT,
      output_index: config.indexName,
    };

    // Start async crawl via external service
    const crawlResponse = await fetch(crawlerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": crawlerApiKey,
      },
      body: JSON.stringify(crawlConfig),
    });

    if (!crawlResponse.ok) {
      const errorData = await crawlResponse.json();
      console.error("Crawler service error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to start crawl",
          message: errorData.message || "Unknown error",
        },
        { status: crawlResponse.status }
      );
    }

    const crawlData = await crawlResponse.json();
    const executionId = crawlData.execution_id;

    if (!executionId) {
      return NextResponse.json(
        { error: "No execution ID returned from crawler service" },
        { status: 500 }
      );
    }

    // Update domain config with execution ID
    await esClient.saveDomainConfig({
      ...config,
      crawlExecutionId: executionId,
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        executionId,
        message: "Crawl started successfully",
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Error starting crawl:", error);

    return NextResponse.json(
      {
        error: "Failed to start crawl",
        message: error.message || "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
