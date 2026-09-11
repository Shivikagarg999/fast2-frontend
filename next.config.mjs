/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
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
        destination: 'https://api.gmkart.com/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/terms-conditions',
        destination: '/policies',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
