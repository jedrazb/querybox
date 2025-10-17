import { NextRequest, NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";
import { extractBaseDomain } from "@/lib/utils";

/**
 * GET /{domain}/v1/crawl/status
 * Check crawl execution status via external crawler service
 */
export async function GET(
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

    // If no execution ID, crawl hasn't been started
    if (!config.crawlExecutionId) {
      return NextResponse.json(
        {
          status: "not_started",
          message: "No crawl has been started for this domain",
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Check crawler environment variables
    const crawlerEndpoint = process.env.CRAWLER_ENDPOINT;
    const crawlerApiKey = process.env.CRAWLER_API_KEY;

    if (!crawlerEndpoint || !crawlerApiKey) {
      return NextResponse.json(
        { error: "Crawler service not configured" },
        { status: 500 }
      );
    }

    // Check status via external service
    const statusUrl = `${crawlerEndpoint}/status/${config.crawlExecutionId}`;
    const statusResponse = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "X-API-Key": crawlerApiKey,
      },
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      console.error("Crawler status check error:", errorData);
      return NextResponse.json(
        {
          error: "Failed to check crawl status",
          message: errorData.message || "Unknown error",
        },
        { status: statusResponse.status }
      );
    }

    const statusData = await statusResponse.json();

    // Parse crawler service response
    let crawlStatus: "running" | "completed" | "failed" = "running";
    let stats = null;

    if (statusData.status === "completed") {
      crawlStatus = "completed";
      stats = statusData.result?.stats;
    } else if (statusData.status === "failed") {
      crawlStatus = "failed";
    } else if (statusData.status === "running") {
      crawlStatus = "running";
    }

    // Get current document count
    const docCount = await esClient.getDocumentCount(config.indexName);

    return NextResponse.json(
      {
        status: crawlStatus,
        executionId: config.crawlExecutionId,
        docCount,
        stats,
        message:
          crawlStatus === "completed"
            ? "Crawl completed successfully"
            : crawlStatus === "failed"
            ? "Crawl failed"
            : "Crawl is in progress",
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Error checking crawl status:", error);

    return NextResponse.json(
      {
        error: "Failed to check crawl status",
        message: error.message || "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
