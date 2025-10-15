/**
 * Chat API endpoint - App Router
 * POST /api/querybox/{domain}/v1/chat
 */

import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatResponse } from "@jedrazb/querybox-shared";
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

    const chatRequest: ChatRequest = await request.json();

    if (!chatRequest.message) {
      return NextResponse.json(
        { error: "Missing message parameter" },
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

    if (!domainConfig.agentId) {
      return NextResponse.json(
        { error: "Chat not configured for this domain. Agent ID missing." },
        { status: 400 }
      );
    }

    if (domainConfig.crawlStatus === "error") {
      return NextResponse.json(
        { error: `Domain crawl failed. Status: ${domainConfig.crawlStatus}` },
        { status: 400 }
      );
    }

    // TODO: Implement actual Elasticsearch agent chat
    const response: ChatResponse = {
      message: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content:
          "Chat functionality will be implemented with Elasticsearch agent integration.",
        timestamp: Date.now(),
      },
      conversationId: chatRequest.conversationId || `conv_${Date.now()}`,
    };

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
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
