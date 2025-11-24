import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin-create-order/", "/admin-test-matches/"], // Keep private pages private
    },
    sitemap: "https://yum-yum-pi.vercel.app/sitemap.xml",
  };
}