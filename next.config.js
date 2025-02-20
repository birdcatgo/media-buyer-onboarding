/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    },
    responseLimit: false
  },
  experimental: {
    largePageDataBytes: 128 * 100000
  },
  async rewrites() {
    return [
      {
        source: '/api/:path',
        destination: '/api/:path/route',
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Accept',
            value: '*/*',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          }
        ],
      },
    ];
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  },
}

module.exports = nextConfig 