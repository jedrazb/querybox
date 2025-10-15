import { NextRequest, NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";
import { getKibanaClient } from "@/lib/kibana";
import { extractBaseDomain, sanitizeDomain } from "@/lib/utils";

// Validate domain accessibility and robots.txt
async function validateDomain(
  domain: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 1. Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return {
        valid: false,
        error:
          "Invalid domain format. Please enter a valid domain (e.g., example.com)",
      };
    }

    // 2. Check if domain has at least one dot
    if (!domain.includes(".")) {
      return {
        valid: false,
        error:
          "Please enter a complete domain (e.g., example.com, not just 'example')",
      };
    }

    // 3. Check HTTPS accessibility
    const httpsUrl = `https://${domain}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(httpsUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      if (!response.ok && response.status !== 405) {
        // 405 Method Not Allowed is ok, some servers don't support HEAD
        // Try GET as fallback
        const getController = new AbortController();
        const getTimeoutId = setTimeout(() => getController.abort(), 10000);

        const getResponse = await fetch(httpsUrl, {
          method: "GET",
          signal: getController.signal,
          redirect: "follow",
        });

        clearTimeout(getTimeoutId);

        if (!getResponse.ok) {
          return {
            valid: false,
            error: `Domain is not accessible via HTTPS. Status: ${getResponse.status}`,
          };
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          valid: false,
          error:
            "Domain request timed out. Please ensure the domain is accessible.",
        };
      }
      // Check for common network errors indicating domain doesn't exist
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo")
      ) {
        return {
          valid: false,
          error:
            "Domain does not exist or cannot be resolved. Please check the domain name.",
        };
      }
      return {
        valid: false,
        error: `We cannot access this domain. Please check the domain name.`,
      };
    }

    // 4. Check robots.txt
    try {
      const robotsUrl = `https://${domain}/robots.txt`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const robotsResponse = await fetch(robotsUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text();

        // Check for explicit Disallow: / for all user agents
        const lines = robotsText.split("\n");
        let currentUserAgent = "";
        let disallowAll = false;

        for (const line of lines) {
          const trimmedLine = line.trim().toLowerCase();

          if (trimmedLine.startsWith("user-agent:")) {
            currentUserAgent = trimmedLine.split(":")[1].trim();
          }

          if (
            (currentUserAgent === "*" || currentUserAgent === "") &&
            trimmedLine === "disallow: /"
          ) {
            disallowAll = true;
            break;
          }
        }

        if (disallowAll) {
          return {
            valid: false,
            error: "robots.txt disallows crawling of this domain (Disallow: /)",
          };
        }
      }
      // If robots.txt doesn't exist or isn't accessible, that's fine - proceed
    } catch (error: any) {
      // robots.txt check is non-critical, log but don't fail
      console.log(`Could not check robots.txt for ${domain}:`, error.message);
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: `Domain validation failed: ${error.message}`,
    };
  }
}

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

    // Verify that the resources in the config actually exist
    const kibanaClient = getKibanaClient();

    // Check if index exists
    const indexExists = await esClient.indexExists(config.indexName);

    // Check if agent exists
    let agentExists = false;
    if (config.agentId) {
      try {
        await kibanaClient.getAgent(config.agentId);
        agentExists = true;
      } catch (error) {
        console.error("Agent not found:", config.agentId);
      }
    }

    // If either resource doesn't exist, return exists: false
    if (!indexExists || !agentExists) {
      return NextResponse.json(
        {
          exists: false,
          domain: baseDomain,
          reason: !indexExists ? "Index not found" : "Agent not found",
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

    // Validate domain before creating resources
    console.log(`Validating domain: ${baseDomain}`);
    const validation = await validateDomain(baseDomain);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Domain validation failed",
          message: validation.error,
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    console.log(`Domain validation passed for: ${baseDomain}`);

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
