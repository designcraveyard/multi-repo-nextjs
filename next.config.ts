import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize Phosphor Icons to prevent compiling all ~9000 icons in dev
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
