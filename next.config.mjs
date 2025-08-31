const nextConfig = {
  images: {
    domains: ['i.pinimg.com', 'images.unsplash.com','ik.imagekit.io',
      'fast2-backend.onrender.com'],
  },
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }];
    return config;
  },
};

export default nextConfig;