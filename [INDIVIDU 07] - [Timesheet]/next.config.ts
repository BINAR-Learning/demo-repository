import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Enable experimental features for canary version
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  },
  // Ensure proper handling of routes
  trailingSlash: false,
  // Disable image optimization if not needed
  images: {
    unoptimized: true
  }
};

export default nextConfig;
