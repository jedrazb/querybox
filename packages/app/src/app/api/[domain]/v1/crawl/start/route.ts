import { NextRequest, NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";
import { extractBaseDomain } from "@/lib/utils";

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

    // Build domains array - add www. only if no subdomain exists
    const domains = [
      {
        url: `https://${baseDomain}`,
        seed_urls: [`https://${baseDomain}`],
      },
    ];

    if (!hasSubdomain) {
      domains.push({
        url: `https://www.${baseDomain}`,
        seed_urls: [`https://www.${baseDomain}`],
      });
    }

    // Start async crawl via external service
    const crawlResponse = await fetch(crawlerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": crawlerApiKey,
      },
      body: JSON.stringify({
        domains,
        output_index: config.indexName,
      }),
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
