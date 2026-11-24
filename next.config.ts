import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Docker image sets BUILD_STANDALONE=1; `npm start` needs the regular output.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  serverExternalPackages: ["@libsql/client", "libsql"],
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@ip-location-db/dbip-country-mmdb/dbip-country.mmdb"],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
