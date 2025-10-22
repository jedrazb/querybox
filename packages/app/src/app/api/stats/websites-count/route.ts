import { NextResponse } from "next/server";
import { getElasticsearchClient } from "@/lib/elasticsearch";

// Cache configuration
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
let cachedCount: number | null = null;
let cacheTimestamp: number | null = null;

/**
 * GET endpoint to return the count of websites (querybox-crawler-* indices)
 * Caches result for 4 hours
 */
export async function GET() {
  try {
    const now = Date.now();

    // Check if cache is valid
    if (
      cachedCount !== null &&
      cacheTimestamp !== null &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      return NextResponse.json(
        {
          count: cachedCount,
          cached: true,
          cacheAge: Math.floor((now - cacheTimestamp) / 1000), // seconds
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": `public, s-maxage=${Math.floor(
              (CACHE_DURATION - (now - cacheTimestamp)) / 1000
            )}`,
          },
        }
      );
    }

    // Cache is invalid, fetch fresh data
    const esClient = getElasticsearchClient();

    // Get all indices matching querybox-crawler-* pattern
    const response = await esClient["client"].cat.indices({
      index: "querybox-crawler-*",
      format: "json",
      h: ["index"], // Only get index names
    });

    const count = Array.isArray(response) ? response.length : 0;

    // Update cache
    cachedCount = count;
    cacheTimestamp = now;

    return NextResponse.json(
      {
        count,
        cached: false,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": `public, s-maxage=${Math.floor(
            CACHE_DURATION / 1000
          )}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching website count:", error);

    // If there's an error but we have cached data, return it
    if (cachedCount !== null) {
      return NextResponse.json(
        {
          count: cachedCount,
          cached: true,
          error: "Using cached data due to fetch error",
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch website count",
        message: error.message || "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
