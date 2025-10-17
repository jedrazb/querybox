/**
 * Chat API endpoint - App Router with SSE streaming
 * POST /{domain}/v1/chat
 */

import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatChunk } from "@jedrazb/querybox-shared";
import { getElasticsearchClient } from "@/lib/elasticsearch";
import { getKibanaClient } from "@/lib/kibana";

export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;

    if (!domain) {
      return new Response(
        JSON.stringify({ error: "Invalid domain parameter" }),
        { status: 400 }
      );
    }

    const chatRequest: ChatRequest = await request.json();

    if (!chatRequest.message) {
      return new Response(
        JSON.stringify({ error: "Missing message parameter" }),
        { status: 400 }
      );
    }

    // Log conversation continuity
    if (chatRequest.conversationId) {
      console.log(
        `[Chat API] Continuing conversation: ${chatRequest.conversationId}`
      );
    } else {
      console.log("[Chat API] Starting new conversation");
    }

    const esClient = getElasticsearchClient();

    // Get domain configuration
    const domainConfig = await esClient.getDomainConfig(domain);

    if (!domainConfig) {
      return new Response(JSON.stringify({ error: "Domain not configured" }), {
        status: 404,
      });
    }

    if (!domainConfig.agentId) {
      return new Response(
        JSON.stringify({
          error: "Chat not configured for this domain. Agent ID missing.",
        }),
        { status: 400 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageId = `msg_${Date.now()}`;
          let conversationId = chatRequest.conversationId;

          const kibanaClient = getKibanaClient();

          // Stream from Kibana Agent Builder
          const agentStream = kibanaClient.converseAsync(
            domainConfig.agentId!,
            chatRequest.message,
            chatRequest.conversationId
          );

          for await (const event of agentStream) {
            // Handle conversation ID
            if (
              event.event === "conversation_created" &&
              event.data?.data?.conversation_id
            ) {
              conversationId = event.data.data.conversation_id;

              // Send conversation ID to client immediately
              const convChunk: ChatChunk = {
                type: "text",
                content: "",
                messageId,
                conversationId,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(convChunk)}\n\n`)
              );
            }

            // Transform Kibana agent builder events to our format
            const chunks = transformKibanaEvent(
              event,
              messageId,
              conversationId
            );

            for (const chunk of chunks) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            }
          }

          // Send done event
          const doneChunk: ChatChunk = { type: "done", messageId };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(doneChunk)}\n\n`)
          );

          controller.close();
        } catch (error: any) {
          console.error("Stream error:", error);
          const errorChunk: ChatChunk = {
            type: "error",
            error: error.message || "Stream error",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}

/**
 * Transform Kibana Agent Builder event to ChatChunk format
 * Reference: https://www.elastic.co/docs/api/doc/serverless/operation/operation-post-agent-builder-converse-async
 */
function transformKibanaEvent(
  event: any,
  messageId: string,
  conversationId?: string
): ChatChunk[] {
  const chunks: ChatChunk[] = [];
  const eventType = event.event;
  const data = event.data?.data;

  // Log all events for debugging
  console.log("Kibana event:", eventType);

  if (!data) {
    console.warn("Event has no data:", event);
    return chunks;
  }

  switch (eventType) {
    case "reasoning":
      break;

    case "tool_call":
      break;

    case "tool_progress":
      break;

    case "tool_result":
      break;

    case "message_chunk":
      // Streaming text chunks
      if (data.text_chunk) {
        chunks.push({
          type: "text",
          content: data.text_chunk,
          messageId,
        });
      }
      break;

    case "message_complete":
      break;

    case "conversation_created":
      break;

    case "round_complete":
      break;

    default:
      // Don't log empty events
      if (eventType) {
        console.log("Unknown Kibana event type:", eventType);
      }
      break;
  }

  return chunks;
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
