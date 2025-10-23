/**
 * Search API endpoint - App Router
 * POST /{domain}/v1/search
 */

import { NextRequest, NextResponse } from "next/server";
import type { SearchRequest } from "@jedrazb/querybox-shared";
import { getElasticsearchClient } from "@/lib/elasticsearch";

export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;

    if (!domain) {
      return NextResponse.json(
        { error: "Invalid domain parameter" },
        { status: 400 }
      );
    }

    const searchRequest: SearchRequest = await request.json();

    if (!searchRequest.query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    const esClient = getElasticsearchClient();

    // Get domain configuration
    const domainConfig = await esClient.getDomainConfig(domain);

    if (!domainConfig) {
      return NextResponse.json(
        { error: "Domain not configured" },
        { status: 404 }
      );
    }

    // Perform search
    const searchResponse = await esClient.search(
      domainConfig.indexName,
      searchRequest
    );

    return NextResponse.json(searchResponse, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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
