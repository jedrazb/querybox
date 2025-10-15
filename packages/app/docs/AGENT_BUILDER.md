# Agent Builder Integration

This document describes how to use the Elastic Agent Builder API integration in QueryBox.

## Overview

Agent Builder is a set of AI-powered capabilities for developing and interacting with agents that work with your Elasticsearch data. QueryBox provides a Kibana client that simplifies interaction with Agent Builder endpoints.

Reference: [Elastic Agent Builder API Documentation](https://www.elastic.co/docs/api/doc/serverless/group/endpoint-agent-builder)

## Setup

### Environment Variables

Add the following environment variable to your `.env` file:

```bash
# Kibana Configuration (for Agent Builder)
KIBANA_HOST=https://your-instance.kb.cloud.es.io
```

The Kibana client uses the same `API_KEY` as the Elasticsearch client.

## Kibana Client Usage

### Initialize the Client

```typescript
import { getKibanaClient } from "@/lib/kibana";

const kibana = getKibanaClient();
```

### Tools Management

#### List All Tools

```typescript
const tools = await kibana.listTools();
```

#### Create a Tool

```typescript
const tool = await kibana.createTool({
  name: "search_docs",
  description: "Search through documentation",
  schema: {
    type: "object",
    properties: {
      query: { type: "string" },
      limit: { type: "number" },
    },
    required: ["query"],
  },
  type: "function",
});
```

#### Get a Tool by ID

```typescript
const tool = await kibana.getTool("tool-id");
```

#### Update a Tool

```typescript
const updatedTool = await kibana.updateTool("tool-id", {
  description: "Updated description",
});
```

#### Delete a Tool

```typescript
await kibana.deleteTool("tool-id");
```

### Agents Management

#### List All Agents

```typescript
const agents = await kibana.listAgents();
```

#### Create an Agent

```typescript
const agent = await kibana.createAgent({
  name: "Documentation Assistant",
  description: "Helps users find information in documentation",
  instructions:
    "You are a helpful assistant that searches through documentation to answer user questions.",
  tools: ["tool-id-1", "tool-id-2"],
  model: "gpt-4",
});
```

#### Get an Agent by ID

```typescript
const agent = await kibana.getAgent("agent-id");
```

#### Update an Agent

```typescript
const updatedAgent = await kibana.updateAgent("agent-id", {
  instructions: "Updated instructions",
});
```

#### Delete an Agent

```typescript
await kibana.deleteAgent("agent-id");
```

### Conversations

#### List Conversations

```typescript
const conversations = await kibana.listConversations();
```

#### Get a Conversation

```typescript
const conversation = await kibana.getConversation("conversation-id");
```

#### Send a Message (Non-Streaming)

```typescript
const response = await kibana.sendMessage("agent-id", {
  message: "What is QueryBox?",
  conversationId: "conversation-id", // Optional, for continuing a conversation
});

console.log(response.messages);
```

#### Send a Message (Streaming)

```typescript
const stream = kibana.sendMessageStreaming("agent-id", {
  message: "What is QueryBox?",
  conversationId: "conversation-id", // Optional
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

#### Delete a Conversation

```typescript
await kibana.deleteConversation("conversation-id");
```

### Execute a Tool

```typescript
const result = await kibana.executeTool("tool-id", {
  query: "search term",
  limit: 10,
});
```

## Example Use Cases

### 1. Create a Search Tool

```typescript
const kibana = getKibanaClient();

// Create a tool that searches your Elasticsearch index
const searchTool = await kibana.createTool({
  name: "search_knowledge_base",
  description: "Searches the knowledge base for relevant information",
  schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query",
      },
      size: {
        type: "number",
        description: "Number of results to return",
        default: 10,
      },
    },
    required: ["query"],
  },
});
```

### 2. Create an Agent with the Tool

```typescript
const agent = await kibana.createAgent({
  name: "Knowledge Base Assistant",
  description: "An AI assistant that helps users find information",
  instructions: `You are a helpful assistant that answers questions by searching the knowledge base.
    When a user asks a question, use the search_knowledge_base tool to find relevant information,
    then provide a clear and concise answer based on the search results.`,
  tools: [searchTool.id],
  model: "gpt-4",
});
```

### 3. Have a Conversation

```typescript
// Start a new conversation
const response1 = await kibana.sendMessage(agent.id, {
  message: "What is Elasticsearch?",
});

console.log(
  "Assistant:",
  response1.messages[response1.messages.length - 1].content
);

// Continue the conversation
const response2 = await kibana.sendMessage(agent.id, {
  message: "How do I create an index?",
  conversationId: response1.conversationId,
});

console.log(
  "Assistant:",
  response2.messages[response2.messages.length - 1].content
);
```

### 4. Stream Responses for Real-time Updates

```typescript
const stream = kibana.sendMessageStreaming(agent.id, {
  message: "Explain how Agent Builder works",
});

process.stdout.write("Assistant: ");
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
console.log("\n");
```

## Error Handling

All client methods may throw errors. It's recommended to use try-catch blocks:

```typescript
try {
  const agent = await kibana.getAgent("agent-id");
  console.log(agent);
} catch (error: any) {
  if (error.status === 404) {
    console.error("Agent not found");
  } else {
    console.error("Error fetching agent:", error.message);
  }
}
```

## Best Practices

1. **Singleton Pattern**: The Kibana client uses a singleton pattern. Always use `getKibanaClient()` to get the instance.

2. **Environment Variables**: Ensure `KIBANA_HOST` and `API_KEY` are set before initializing the client.

3. **Tool Schema**: When creating tools, provide clear descriptions and well-defined schemas to help the agent understand how to use them.

4. **Agent Instructions**: Write clear and specific instructions for your agents. Include examples of how they should behave and when to use specific tools.

5. **Conversation Management**: Store conversation IDs if you want to maintain context across multiple messages.

6. **Streaming**: Use streaming for long-form responses to provide a better user experience with real-time feedback.

7. **Error Handling**: Always implement proper error handling, especially for user-facing features.

## Troubleshooting

### "Missing Kibana credentials in environment variables"

Make sure `KIBANA_HOST` and `API_KEY` are set in your environment:

```bash
KIBANA_HOST=https://your-instance.kb.cloud.es.io
API_KEY=your_api_key_here
```

### "Kibana request failed: 401 Unauthorized"

Your API key may be invalid or expired. Check your Elastic Cloud console to verify your API key.

### "Kibana request failed: 404 Not Found"

The resource you're trying to access doesn't exist. Verify the ID is correct and the resource was created successfully.

## Additional Resources

- [Elastic Agent Builder Documentation](https://www.elastic.co/docs/api/doc/serverless/group/endpoint-agent-builder)
- [Elasticsearch Client Documentation](./CONFIG.md)
- [QueryBox API Documentation](./README.md)
