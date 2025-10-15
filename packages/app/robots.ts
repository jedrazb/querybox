import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  };
}
