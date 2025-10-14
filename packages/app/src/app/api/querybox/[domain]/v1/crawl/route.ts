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
import { initiateCrawl } from "@/services/crawler";

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

    // Check if domain already exists
    let domainConfig = await esClient.getDomainConfig(domain);

    if (domainConfig && domainConfig.status === "crawling") {
      return NextResponse.json(
        { error: "Crawl already in progress for this domain" },
        { status: 400 }
      );
    }

    // Create index name
    const indexName = `querybox_${domain
      .replace(/[^a-z0-9_]/gi, "_")
      .toLowerCase()}`;

    // Create or update domain config
    const newConfig: DomainConfig = {
      domain,
      indexName,
      status: "crawling",
      crawlConfig: crawlRequest.config,
      createdAt: domainConfig?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await esClient.saveDomainConfig(newConfig);

    // Create index if it doesn't exist
    const indexExists = await esClient.indexExists(indexName);
    if (!indexExists) {
      await esClient.createIndex(indexName);
    }

    // Initiate crawl (async operation)
    initiateCrawl(domain, crawlRequest.config, esClient);

    const status: CrawlStatus = {
      domain,
      status: "crawling",
      startedAt: Date.now(),
    };

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
