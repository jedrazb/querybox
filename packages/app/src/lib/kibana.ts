/**
 * Kibana client for Agent Builder API
 * Handles all Kibana Agent Builder operations with server-side credentials
 * Reference: https://www.elastic.co/docs/api/doc/serverless/group/endpoint-agent-builder
 */

export interface KibanaTool {
  id: string;
  description: string;
  configuration: Record<string, unknown>;
  type: string;
  tags?: string[];
}

export interface KibanaAgent {
  id: string;
  name: string;
  description: string;
  configuration: {
    instructions: string;
    tools: {
      tool_ids: string[];
    }[];
  };
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConversationResponse {
  conversationId: string;
  messages: ChatMessage[];
}

export interface CreateToolRequest {
  id: string;
  description: string;
  configuration: Record<string, unknown>;
  type: string;
  tags?: string[];
}

export interface CreateAgentRequest {
  id: string;
  name: string;
  description: string;
  configuration: {
    instructions: string;
    tools: {
      tool_ids: string[];
    }[];
  };
}

export interface SendMessageRequest {
  message: string;
  conversationId?: string;
}

export class KibanaClient {
  private host: string;
  private apiKey: string;

  constructor() {
    this.host = process.env.KIBANA_HOST || "";
    this.apiKey = process.env.API_KEY || "";

    if (!this.host || !this.apiKey) {
      throw new Error("Missing Kibana credentials in environment variables");
    }

    // Ensure host doesn't have trailing slash
    this.host = this.host.replace(/\/$/, "");
  }

  /**
   * List all tools
   */
  async listTools(): Promise<KibanaTool[]> {
    return this.makeRequest<KibanaTool[]>("/api/agent_builder/tools", {
      method: "GET",
    });
  }

  /**
   * Create a new tool
   */
  async createTool(tool: CreateToolRequest): Promise<KibanaTool> {
    return this.makeRequest<KibanaTool>("/api/agent_builder/tools", {
      method: "POST",
      body: JSON.stringify(tool),
    });
  }

  /**
   * Get a tool by ID
   */
  async getTool(toolId: string): Promise<KibanaTool> {
    return this.makeRequest<KibanaTool>(`/api/agent_builder/tools/${toolId}`, {
      method: "GET",
    });
  }

  /**
   * Update a tool
   */
  async updateTool(
    toolId: string,
    tool: Partial<CreateToolRequest>
  ): Promise<KibanaTool> {
    return this.makeRequest<KibanaTool>(`/api/agent_builder/tools/${toolId}`, {
      method: "PUT",
      body: JSON.stringify(tool),
    });
  }

  /**
   * Delete a tool
   */
  async deleteTool(toolId: string): Promise<void> {
    await this.makeRequest(`/api/agent_builder/tools/${toolId}`, {
      method: "DELETE",
    });
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<KibanaAgent[]> {
    return this.makeRequest<KibanaAgent[]>("/api/agent_builder/agents", {
      method: "GET",
    });
  }

  /**
   * Create a new agent
   */
  async createAgent(agent: CreateAgentRequest): Promise<KibanaAgent> {
    return this.makeRequest<KibanaAgent>("/api/agent_builder/agents", {
      method: "POST",
      body: JSON.stringify(agent),
    });
  }

  /**
   * Get an agent by ID
   */
  async getAgent(agentId: string): Promise<KibanaAgent> {
    return this.makeRequest<KibanaAgent>(
      `/api/agent_builder/agents/${agentId}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Update an agent
   */
  async updateAgent(
    agentId: string,
    agent: Partial<CreateAgentRequest>
  ): Promise<KibanaAgent> {
    return this.makeRequest<KibanaAgent>(
      `/api/agent_builder/agents/${agentId}`,
      {
        method: "PUT",
        body: JSON.stringify(agent),
      }
    );
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    await this.makeRequest(`/api/agent_builder/agents/${agentId}`, {
      method: "DELETE",
    });
  }

  /**
   * List conversations
   */
  async listConversations(): Promise<ConversationResponse[]> {
    return this.makeRequest<ConversationResponse[]>(
      "/api/agent_builder/conversations",
      {
        method: "GET",
      }
    );
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string): Promise<ConversationResponse> {
    return this.makeRequest<ConversationResponse>(
      `/api/agent_builder/conversations/${conversationId}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await this.makeRequest(
      `/api/agent_builder/conversations/${conversationId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Send a chat message (non-streaming)
   */
  async sendMessage(
    agentId: string,
    request: SendMessageRequest
  ): Promise<ConversationResponse> {
    return this.makeRequest<ConversationResponse>(
      `/api/agent_builder/agents/${agentId}/chat`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Send a chat message with streaming response using the converse/async endpoint
   * Returns an async generator that yields SSE events
   * Reference: https://www.elastic.co/docs/api/doc/serverless/operation/operation-post-agent-builder-converse-async
   */
  async *converseAsync(
    agentId: string,
    input: string,
    conversationId?: string,
    connectorId?: string
  ): AsyncGenerator<any, void, unknown> {
    const url = `${this.host}/api/agent_builder/converse/async`;
    const headers = {
      Authorization: `ApiKey ${this.apiKey}`,
      "Content-Type": "application/json",
      "kbn-xsrf": "true",
    };

    const body: any = {
      input,
      agent_id: agentId,
    };

    if (conversationId) {
      body.conversation_id = conversationId;
    }

    if (connectorId) {
      body.connector_id = connectorId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Kibana Agent Builder request failed: ${response.statusText} - ${errorText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let event = "";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            event = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              yield { event, data: parsed };
              event = "";
              data = "";
            } catch (error) {
              console.error("Failed to parse SSE data:", error, data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Send a chat message with streaming response
   * Returns an async generator that yields message chunks
   * @deprecated Use converseAsync instead for better streaming support
   */
  async *sendMessageStreaming(
    agentId: string,
    request: SendMessageRequest
  ): AsyncGenerator<string, void, unknown> {
    const url = `${this.host}/api/agent_builder/agents/${agentId}/chat/stream`;
    const headers = {
      Authorization: `ApiKey ${this.apiKey}`,
      "Content-Type": "application/json",
      "kbn-xsrf": "true",
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Kibana request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Execute a tool
   */
  async executeTool(
    toolId: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    return this.makeRequest(`/api/agent_builder/tools/${toolId}/execute`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Make request to Kibana API
   */
  private async makeRequest<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.host}${path}`;
    const headers = {
      Authorization: `ApiKey ${this.apiKey}`,
      "Content-Type": "application/json",
      "kbn-xsrf": "true", // Required by Kibana for POST/PUT/DELETE requests
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      const error: any = new Error(
        `Kibana request failed: ${response.statusText} - ${errorText}`
      );
      error.status = response.status;
      error.response = errorText;
      throw error;
    }

    // Handle empty responses (e.g., DELETE requests)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json();
  }
}

// Singleton instance
let kibanaClient: KibanaClient | null = null;

export function getKibanaClient(): KibanaClient {
  if (!kibanaClient) {
    kibanaClient = new KibanaClient();
  }
  return kibanaClient;
}
