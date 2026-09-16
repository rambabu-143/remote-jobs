import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // Prisma's query engine binary is loaded via raw fs access, not a static
  // require(), so Next's output file tracing misses it unless told explicitly.
  outputFileTracingIncludes: {
    "/*": ["./src/generated/prisma/**/*"],
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
