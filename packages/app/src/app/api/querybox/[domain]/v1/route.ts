import { NextRequest, NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";
import { getKibanaClient } from "@/lib/kibana";
import { extractBaseDomain, sanitizeDomain } from "@/lib/utils";

// GET endpoint to check if domain configuration exists
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

    // Extract base domain (no protocol)
    const baseDomain = extractBaseDomain(domain);

    // Initialize client
    const esClient = getElasticsearchClient();

    // Check if domain config exists
    const config = await esClient.getDomainConfig(baseDomain);

    if (!config) {
      return NextResponse.json(
        {
          exists: false,
          domain: baseDomain,
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Get document count
    const docCount = await esClient.getDocumentCount(config.indexName);

    return NextResponse.json(
      {
        exists: true,
        domain: baseDomain,
        indexName: config.indexName,
        agentId: config.agentId,
        docCount,
        crawlStatus: config.crawlStatus,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Error checking domain configuration:", error);

    return NextResponse.json(
      {
        error: "Failed to check domain configuration",
        message: error.message || "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

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

    // Extract base domain (no protocol)
    const baseDomain = extractBaseDomain(domain);
    const sanitizedDomain = sanitizeDomain(baseDomain);

    // Initialize clients
    const esClient = getElasticsearchClient();
    const kibanaClient = getKibanaClient();

    // Create index name
    const indexName = `querybox-crawler-${sanitizedDomain}`;

    // 1. Create Elasticsearch index if it doesn't exist
    const indexExists = await esClient.indexExists(indexName);
    if (!indexExists) {
      console.log(`Creating index: ${indexName}`);
      await esClient.createCrawlerIndex(indexName);
    } else {
      console.log(`Index already exists: ${indexName}`);
    }

    // 2. Create or get agent builder tool to search this index
    const toolId = `querybox.search.public.${sanitizedDomain}`;
    let tool;
    try {
      tool = await kibanaClient.getTool(toolId);
      console.log(`Tool already exists: ${toolId}`);
    } catch (error: any) {
      // Tool doesn't exist, create it
      console.log(`Creating tool: ${toolId}`);
      tool = await kibanaClient.createTool({
        id: toolId,
        description: `Search the ${baseDomain} public crawled content. Use this tool to find information about the public content available on ${baseDomain}.`,
        type: "index_search",
        tags: ["querybox", "search"],
        configuration: {
          pattern: indexName,
        },
      });
      console.log(`Tool created: ${toolId}`);
    }

    // 3. Create or get agent with the tool
    const agentId = `${sanitizedDomain}-agent`;
    let agent;
    try {
      agent = await kibanaClient.getAgent(agentId);
      console.log(`Agent already exists: ${agentId}`);
    } catch (error: any) {
      // Agent doesn't exist, create it
      console.log(`Creating agent: ${agentId}`);
      agent = await kibanaClient.createAgent({
        id: agentId,
        name: `${baseDomain} Assistant`,
        description: `AI assistant for ${baseDomain} that can search and answer questions about the website.`,
        configuration: {
          instructions: `You are a helpful assistant for ${baseDomain}. Use the search tool to find relevant information when answering questions. Always cite your sources by mentioning the relevant URLs and page titles.`,
          tools: [
            {
              tool_ids: [tool.id],
            },
          ],
        },
      });
      console.log(`Agent created: ${agentId}`);
    }

    // 4. Save domain configuration
    const now = Date.now();
    await esClient.saveDomainConfig({
      domain: baseDomain,
      indexName: indexName,
      agentId: agent.id,
      createdAt: now,
      updatedAt: now,
      crawlStatus: "pending",
      crawlConfig: {
        startUrl: baseDomain,
      },
    });

    // Get document count
    const docCount = await esClient.getDocumentCount(indexName);

    // Return success with resources (created or existing)
    return NextResponse.json(
      {
        success: true,
        domain: baseDomain,
        indexName: indexName,
        toolIds: [tool.id],
        agentId: agent.id,
        docCount,
        message: indexExists
          ? "QueryBox configuration already exists"
          : "QueryBox configuration created successfully",
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
    console.error("Error creating QueryBox configuration:", error);

    return NextResponse.json(
      {
        error: "Failed to create QueryBox configuration",
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
