"use client";

import { useState, useEffect } from "react";
import styles from "./FlipCounter.module.css";

interface FlipCounterProps {
  targetNumber: number;
  duration?: number;
}

export default function FlipCounter({
  targetNumber,
  duration = 2500,
}: FlipCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (targetNumber === 0) return;

    let startTime: number | null = null;
    const startCount = count;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(
        startCount + (targetNumber - startCount) * easeOut
      );

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetNumber]);

  return (
    <div className={styles.counter}>
      <span className={styles.number}>{count.toLocaleString()}</span>
    </div>
  );
}
