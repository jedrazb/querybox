import { NextRequest, NextResponse } from "next/server";
import { extractBaseDomain } from "@/lib/utils";

// Check if domain redirects and return the final domain
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

    // Try to access the domain and follow redirects
    const httpsUrl = `https://${baseDomain}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(httpsUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      // Extract the final URL after redirects
      const finalUrl = response.url;
      let finalDomain = baseDomain;

      if (finalUrl) {
        try {
          const url = new URL(finalUrl);
          finalDomain = url.hostname;
        } catch (e) {
          console.error("Failed to parse final URL:", finalUrl);
        }
      }

      // Check if redirect occurred
      const redirected = finalDomain !== baseDomain;

      return NextResponse.json(
        {
          originalDomain: baseDomain,
          finalDomain,
          redirected,
          accessible: response.ok || response.status === 405,
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
    } catch (error: any) {
      // If HEAD fails, try GET
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(httpsUrl, {
          method: "GET",
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timeoutId);

        // Extract the final URL after redirects
        const finalUrl = response.url;
        let finalDomain = baseDomain;

        if (finalUrl) {
          try {
            const url = new URL(finalUrl);
            finalDomain = url.hostname;
          } catch (e) {
            console.error("Failed to parse final URL:", finalUrl);
          }
        }

        // Check if redirect occurred
        const redirected = finalDomain !== baseDomain;

        return NextResponse.json(
          {
            originalDomain: baseDomain,
            finalDomain,
            redirected,
            accessible: response.ok,
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
      } catch (getError: any) {
        // Return error info
        return NextResponse.json(
          {
            originalDomain: baseDomain,
            finalDomain: baseDomain,
            redirected: false,
            accessible: false,
            error: getError.message,
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
    }
  } catch (error: any) {
    console.error("Error checking redirect:", error);

    return NextResponse.json(
      {
        error: "Failed to check redirect",
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

// Handle OPTIONS requests for CORS
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
