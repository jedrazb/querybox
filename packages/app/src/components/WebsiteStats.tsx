"use client";

import { useState, useEffect } from "react";
import FlipCounter from "./FlipCounter";
import styles from "./WebsiteStats.module.css";

export default function WebsiteStats() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/stats/websites-count");
        if (!response.ok) {
          throw new Error("Failed to fetch count");
        }
        const data = await response.json();
        setCount(data.count);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching website count:", err);
        setError("Unable to load stats");
        setIsLoading(false);
      }
    };

    fetchCount();
  }, []);

  if (error) {
    return null; // Gracefully hide if there's an error
  }

  return (
    <div className={styles.websiteStats}>
      {isLoading ? (
        <div className={styles.loadingSpinner}></div>
      ) : (
        <>
          <FlipCounter targetNumber={count} duration={2500} />
          <div className={styles.statsText}>
            <span className={styles.statsLabel}>
              {count === 1 ? "website already added" : "websites already added"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
