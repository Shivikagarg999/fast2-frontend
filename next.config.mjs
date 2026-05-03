/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }];
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: 'https://api.fast2.in/:path*',
      },
    ];
  },
};

export default nextConfig;