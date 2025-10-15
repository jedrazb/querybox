"use client";

import { useState } from "react";
import styles from "./InstallationTabs.module.css";

type InstallationType = "cdn" | "npm" | "nextjs" | "react" | "wordpress";

interface InstallationTabsProps {
  apiUrl?: string;
  domain?: string;
  theme?: string;
  primaryColor?: string;
  title?: string;
}

export default function InstallationTabs({
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
  domain = "{your-domain}",
  theme = "auto",
  primaryColor = "#ec4899",
  title = "",
}: InstallationTabsProps) {
  const [activeTab, setActiveTab] = useState<InstallationType>("cdn");

  const apiEndpoint = `${apiUrl}/api/querybox/${domain}/v1`;

  // Helper to generate config string
  const configString = `apiEndpoint: '${apiEndpoint}',
    theme: '${theme}',
    primaryColor: '${primaryColor}'${title ? `,\n    title: '${title}'` : ""}`;

  const cdnCode = `<!-- Add to your HTML <head> -->
<link rel="stylesheet" href="https://unpkg.com/@jedrazb/querybox/dist/style.css">
<script src="https://unpkg.com/@jedrazb/querybox/dist/querybox.umd.js"></script>

<!-- Add before closing </body> tag -->
<script>
  const querybox = new QueryBox({
    ${configString}
  });

  // Add keyboard shortcut (Cmd+K / Ctrl+K)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      querybox.search();
    }
  });
</script>`;

  const npmCode = `# Install the package
npm install @jedrazb/querybox

# Or with pnpm
pnpm add @jedrazb/querybox

# Or with yarn
yarn add @jedrazb/querybox`;

  const npmUsageCode = `import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

const querybox = new QueryBox({
  ${configString}
});

// Open search
querybox.search();

// Open AI chat
querybox.chat();`;

  const nextjsCode = `// app/layout.tsx or pages/_app.tsx
import '@jedrazb/querybox/dist/style.css';

// components/QueryBoxProvider.tsx
'use client';

import { useEffect, useRef } from 'react';
import QueryBox from '@jedrazb/querybox';

export function QueryBoxProvider({ children }: { children: React.ReactNode }) {
  const queryboxRef = useRef<QueryBox | null>(null);

  useEffect(() => {
    queryboxRef.current = new QueryBox({
      ${configString}
    });

    // Add keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        queryboxRef.current?.search();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      queryboxRef.current?.destroy();
    };
  }, []);

  return <>{children}</>;
}`;

  const reactCode = `import { useEffect, useRef } from 'react';
import QueryBox from '@jedrazb/querybox';
import '@jedrazb/querybox/dist/style.css';

function App() {
  const queryboxRef = useRef<QueryBox | null>(null);

  useEffect(() => {
    // Initialize QueryBox
    queryboxRef.current = new QueryBox({
      ${configString}
    });

    // Add keyboard shortcut (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        queryboxRef.current?.search();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      queryboxRef.current?.destroy();
    };
  }, []);

  return (
    <>
      <button onClick={() => queryboxRef.current?.search()}>
        Search
      </button>
      <button onClick={() => queryboxRef.current?.chat()}>
        AI Chat
      </button>
    </>
  );
}

export default App;`;

  const wordpressCode = `<!-- Add to your WordPress theme's header.php, before </head> -->
<link rel="stylesheet" href="https://unpkg.com/@jedrazb/querybox/dist/style.css">
<script src="https://unpkg.com/@jedrazb/querybox/dist/querybox.umd.js"></script>

<!-- Add to your theme's footer.php, before </body> -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const querybox = new QueryBox({
      ${configString}
    });

    // Add keyboard shortcut (Cmd+K / Ctrl+K)
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        querybox.search();
      }
    });

    // Optional: Add a search button to your navigation
    // Replace '#search-button' with your button's selector
    var searchBtn = document.querySelector('#search-button');
    if (searchBtn) {
      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        querybox.search();
      });
    }
  });
</script>`;

  const tabs: { id: InstallationType; label: string }[] = [
    { id: "cdn", label: "CDN" },
    { id: "npm", label: "npm" },
    { id: "nextjs", label: "Next.js" },
    { id: "react", label: "React" },
    { id: "wordpress", label: "WordPress" },
  ];

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
        {activeTab === "cdn" && (
          <div className={styles.codeBlock}>
            <pre>
              <code>{cdnCode}</code>
            </pre>
          </div>
        )}

        {activeTab === "npm" && (
          <div>
            <div className={styles.codeBlock}>
              <pre>
                <code>{npmCode}</code>
              </pre>
            </div>
            <h4 className={styles.usageTitle}>Usage</h4>
            <div className={styles.codeBlock}>
              <pre>
                <code>{npmUsageCode}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === "nextjs" && (
          <div className={styles.codeBlock}>
            <pre>
              <code>{nextjsCode}</code>
            </pre>
          </div>
        )}

        {activeTab === "react" && (
          <div className={styles.codeBlock}>
            <pre>
              <code>{reactCode}</code>
            </pre>
          </div>
        )}

        {activeTab === "wordpress" && (
          <div className={styles.codeBlock}>
            <pre>
              <code>{wordpressCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
