const nextConfig = {
  images: {
    domains: ['i.pinimg.com', 'images.unsplash.com','ik.imagekit.io',
      '193.203.163.101:5000'],
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