import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "www.zevadenim.com",
      },
      {
        protocol: "https",
        hostname: "www.ninelineapparel.com",
      },
      {
        protocol: "https",
        hostname: "ktjkmidczokavuzmpesi.supabase.co",
      },
    ],
  },
};

export default nextConfig;
