import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@linku/shared"],
  typedRoutes: false
};

export default nextConfig;
