import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
let nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  experimental: {
    webpackBuildWorker: true,
  }
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
