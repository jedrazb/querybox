/**
 * Crawl initiation API endpoint - App Router
 * POST /api/querybox/{domain}/v1/crawl
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  CrawlRequest,
  CrawlStatus,
  DomainConfig,
} from "@jedrazb/querybox-shared";
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

    const crawlRequest: CrawlRequest = await request.json();

    if (!crawlRequest.config || !crawlRequest.config.startUrl) {
      return NextResponse.json(
        { error: "Missing crawl configuration" },
        { status: 400 }
      );
    }

    const esClient = getElasticsearchClient();

    /// todo: trigger crawl

    return NextResponse.json(status, {
      status: 202,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Crawl error:", error);
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
