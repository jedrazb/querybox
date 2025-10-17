/**
 * Domain status API endpoint - App Router
 * GET /{domain}/v1/status
 */

import { NextRequest, NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";

export async function GET(
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

    const esClient = getElasticsearchClient();

    // Get domain configuration
    const domainConfig = await esClient.getDomainConfig(domain);

    if (!domainConfig) {
      return NextResponse.json({
        domain,
        configured: false,
      });
    }

    // Get document count
    const documentCount = await esClient.getDocumentCount(
      domainConfig.indexName
    );

    return NextResponse.json(
      {
        domain,
        configured: true,
        indexName: domainConfig.indexName,
        agentId: domainConfig.agentId,
        documentCount,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Status error:", error);
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
