import { NextRequest, NextResponse } from "next/server";
import { extractBaseDomain } from "@/lib/utils";
import { checkDomainRedirect } from "@/lib/redirect-utils";

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

    // Check for redirects using shared utility
    const redirectInfo = await checkDomainRedirect(baseDomain, 10000);

    if (!redirectInfo) {
      // No redirect detected
      return NextResponse.json(
        {
          originalDomain: baseDomain,
          finalDomain: baseDomain,
          finalUrl: `https://${baseDomain}`,
          finalPath: "/",
          redirected: false,
          isSubdomainToPathRedirect: false,
          accessible: true,
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

    // Redirect detected
    const redirected =
      redirectInfo.finalDomain !== baseDomain || redirectInfo.finalPath !== "/";

    return NextResponse.json(
      {
        originalDomain: baseDomain,
        finalDomain: redirectInfo.finalDomain,
        finalUrl: redirectInfo.finalUrl,
        finalPath: redirectInfo.finalPath,
        redirected,
        isSubdomainToPathRedirect: redirectInfo.isSubdomainToPathRedirect,
        accessible: true,
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
