"use client";

import { useState } from "react";
import styles from "./InstallationTabs.module.css";

type ApiType = "search" | "chat";

interface ApiIntegrationProps {
  apiUrl?: string;
  domain?: string;
}

export default function ApiIntegration({
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
  domain = "{your-domain}",
}: ApiIntegrationProps) {
  const [activeTab, setActiveTab] = useState<ApiType>("search");

  const apiEndpoint = `${apiUrl}/${domain}/v1`;

  const searchExample = `// Search endpoint - simple POST request
const searchQuery = async (query) => {
  const response = await fetch('${apiEndpoint}/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  return data;
  // Returns: { results: [...], total: number, took: number }
};

// Usage
const results = await searchQuery('your search term');
results.results.forEach(result => {
  console.log(result.title, result.url);
});`;

  const chatExample = `// Chat endpoint - SSE streaming
const chatWithAI = async (message, conversationId = null) => {
  const response = await fetch('${apiEndpoint}/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationId  // optional: for conversation continuity
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';  // Buffer for incomplete SSE messages
  let fullResponse = '';
  let newConversationId = conversationId;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Accumulate chunks in buffer
    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE messages
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';  // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'text') {
          fullResponse += data.content;
          console.log(data.content); // Stream text as it arrives
        }

        if (data.conversationId) {
          newConversationId = data.conversationId;
        }

        if (data.type === 'done') {
          return { response: fullResponse, conversationId: newConversationId };
        }
      }
    }
  }
};

// Usage - single message
await chatWithAI('What is QueryBox?');

// Usage - conversation
const { conversationId } = await chatWithAI('What is QueryBox?');
await chatWithAI('Tell me more', conversationId);`;

  const searchNodeExample = `// Node.js with node-fetch
import fetch from 'node-fetch';

const searchQuery = async (query) => {
  const response = await fetch('${apiEndpoint}/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  return await response.json();
};

// Use it
searchQuery('elasticsearch').then(data => {
  console.log(\`Found \${data.total} results\`);
  data.results.forEach(r => console.log(r.title));
});`;

  const chatNodeExample = `// Node.js with node-fetch and SSE parsing
import fetch from 'node-fetch';

const chatWithAI = async (message, conversationId = null) => {
  const response = await fetch('${apiEndpoint}/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId })
  });

  let buffer = '';  // Buffer for incomplete SSE messages
  let fullResponse = '';
  let newConversationId = conversationId;

  // Stream processing
  for await (const chunk of response.body) {
    buffer += chunk.toString();

    // Process complete SSE messages
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';  // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'text') {
          process.stdout.write(data.content);
          fullResponse += data.content;
        }

        if (data.conversationId) {
          newConversationId = data.conversationId;
        }

        if (data.type === 'done') {
          console.log('\\n');
          return { response: fullResponse, conversationId: newConversationId };
        }
      }
    }
  }
};`;

  const searchPythonExample = `# Python with requests
import requests

def search_query(query: str):
    response = requests.post(
        '${apiEndpoint}/search',
        json={'query': query}
    )
    return response.json()

# Usage
results = search_query('elasticsearch')
print(f"Found {results['total']} results")
for result in results['results']:
    print(result['title'], result.get('url'))`;

  const chatPythonExample = `# Python with requests and SSE
import requests
import json

def chat_with_ai(message: str, conversation_id: str = None):
    response = requests.post(
        '${apiEndpoint}/chat',
        json={
            'message': message,
            'conversationId': conversation_id
        },
        stream=True  # Enable streaming
    )

    full_response = ''
    new_conversation_id = conversation_id

    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                data = json.loads(line[6:])

                if data['type'] == 'text':
                    print(data['content'], end='', flush=True)
                    full_response += data['content']

                if 'conversationId' in data:
                    new_conversation_id = data['conversationId']

                if data['type'] == 'done':
                    print()  # New line after streaming
                    return {
                        'response': full_response,
                        'conversationId': new_conversation_id
                    }

# Usage
result = chat_with_ai('What is QueryBox?')
# Continue conversation
chat_with_ai('Tell me more', result['conversationId'])`;

  const tabs: { id: ApiType; label: string }[] = [
    { id: "search", label: "Search API" },
    { id: "chat", label: "Chat API" },
  ];

  const [searchLang, setSearchLang] = useState<"js" | "node" | "python">("js");
  const [chatLang, setChatLang] = useState<"js" | "node" | "python">("js");

  return (
    <div className={styles.installationTabs}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              activeTab === tab.id ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "search" && (
          <div>
            <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
              Simple POST request to search your indexed content. Returns
              results with title, content, URL, and score.
            </p>

            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <button
                className={`${styles.tab} ${
                  searchLang === "js" ? styles.tabActive : ""
                }`}
                onClick={() => setSearchLang("js")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                JavaScript
              </button>
              <button
                className={`${styles.tab} ${
                  searchLang === "node" ? styles.tabActive : ""
                }`}
                onClick={() => setSearchLang("node")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                Node.js
              </button>
              <button
                className={`${styles.tab} ${
                  searchLang === "python" ? styles.tabActive : ""
                }`}
                onClick={() => setSearchLang("python")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                Python
              </button>
            </div>

            <div className={styles.codeBlock}>
              <pre>
                <code>
                  {searchLang === "js" && searchExample}
                  {searchLang === "node" && searchNodeExample}
                  {searchLang === "python" && searchPythonExample}
                </code>
              </pre>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "#94a3b8",
              }}
            >
              <strong style={{ color: "#e2e8f0" }}>Response format:</strong>
              <pre
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                  color: "#cbd5e1",
                }}
              >
                {`{
  "results": [
    {
      "id": "doc_123",
      "title": "Page Title",
      "content": "Page content...",
      "url": "https://...",
      "score": 0.95
    }
  ],
  "total": 42,
  "took": 12
}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div>
            <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
              Server-Sent Events (SSE) streaming endpoint for AI chat. Streams
              responses in real-time and maintains conversation context.
            </p>

            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <button
                className={`${styles.tab} ${
                  chatLang === "js" ? styles.tabActive : ""
                }`}
                onClick={() => setChatLang("js")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                JavaScript
              </button>
              <button
                className={`${styles.tab} ${
                  chatLang === "node" ? styles.tabActive : ""
                }`}
                onClick={() => setChatLang("node")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                Node.js
              </button>
              <button
                className={`${styles.tab} ${
                  chatLang === "python" ? styles.tabActive : ""
                }`}
                onClick={() => setChatLang("python")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                Python
              </button>
            </div>

            <div className={styles.codeBlock}>
              <pre>
                <code>
                  {chatLang === "js" && chatExample}
                  {chatLang === "node" && chatNodeExample}
                  {chatLang === "python" && chatPythonExample}
                </code>
              </pre>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "#94a3b8",
              }}
            >
              <strong style={{ color: "#e2e8f0" }}>SSE Event types:</strong>
              <ul
                style={{
                  marginTop: "0.5rem",
                  marginLeft: "1.5rem",
                  color: "#cbd5e1",
                }}
              >
                <li>
                  <code>text</code> - Streaming text content
                </li>
                <li>
                  <code>done</code> - Stream completed
                </li>
                <li>
                  <code>error</code> - Error occurred
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
