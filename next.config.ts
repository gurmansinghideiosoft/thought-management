import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Home-page hero photos.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
