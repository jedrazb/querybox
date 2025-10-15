/**
 * Utility functions for QueryBox
 */

/**
 * Extract base domain from URL string (without protocol)
 * Examples:
 *   https://www.example.com -> www.example.com
 *   http://example.com/path -> example.com
 *   www.example.com -> www.example.com
 *   example.com -> example.com
 */
export function extractBaseDomain(domain: string): string {
  // Remove protocol if present
  let cleanDomain = domain.replace(/^https?:\/\//, "");

  // Remove trailing slash and any path
  cleanDomain = cleanDomain.split("/")[0];

  // Remove port if present
  cleanDomain = cleanDomain.split(":")[0];

  return cleanDomain.toLowerCase().trim();
}

/**
 * Sanitize domain name for use in Elasticsearch indices and identifiers
 * Replaces dots with underscores to create valid identifiers
 * Examples:
 *   www.example.com -> www_example_com
 *   docs.elastic.co -> docs_elastic_co
 */
export function sanitizeDomain(domain: string): string {
  return domain.replace(/\./g, "_");
}
