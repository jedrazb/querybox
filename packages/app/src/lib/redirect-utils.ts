/**
 * Utility functions for detecting and handling domain redirects
 */

export interface RedirectInfo {
  finalDomain: string;
  finalUrl: string;
  finalPath: string;
  isSubdomainToPathRedirect: boolean;
}

/**
 * Check if a domain redirects and return redirect information
 * Handles multiple redirects in a chain (up to 20 by default with fetch)
 */
export async function checkDomainRedirect(
  baseDomain: string,
  timeoutMs: number = 10000
): Promise<RedirectInfo | null> {
  const httpsUrl = `https://${baseDomain}`;

  try {
    // Try HEAD request first (faster)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(httpsUrl, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow", // Follows all redirects in the chain (up to 20)
    });

    clearTimeout(timeoutId);

    return parseRedirectResponse(baseDomain, response.url);
  } catch (headError: any) {
    // If HEAD fails, try GET as fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(httpsUrl, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow", // Follows all redirects in the chain
      });

      clearTimeout(timeoutId);

      return parseRedirectResponse(baseDomain, response.url);
    } catch (getError) {
      console.log(`Could not check redirect for ${baseDomain}:`, getError);
      return null;
    }
  }
}

/**
 * Parse the final URL after redirects to determine redirect type
 */
function parseRedirectResponse(
  baseDomain: string,
  finalUrl: string
): RedirectInfo | null {
  if (!finalUrl) {
    return null;
  }

  try {
    const finalUrlObj = new URL(finalUrl);
    const finalDomain = finalUrlObj.hostname;
    const finalPath = finalUrlObj.pathname;

    // No redirect occurred
    if (finalDomain === baseDomain && finalPath === "/") {
      return null;
    }

    // Check if this is a subdomain-to-path redirect
    // e.g., help.nowtv.com -> www.nowtv.com/gb/help/
    const baseWithoutSubdomain = baseDomain.split(".").slice(-2).join(".");
    const finalWithoutSubdomain = finalDomain.split(".").slice(-2).join(".");

    const isSubdomainToPathRedirect: boolean =
      baseDomain !== finalDomain &&
      baseWithoutSubdomain === finalWithoutSubdomain &&
      finalPath !== "" &&
      finalPath !== "/";

    return {
      finalDomain,
      finalUrl,
      finalPath,
      isSubdomainToPathRedirect,
    };
  } catch (e) {
    console.error("Failed to parse final URL:", finalUrl, e);
    return null;
  }
}
