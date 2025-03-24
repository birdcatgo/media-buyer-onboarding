/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Avoid bundling server-only modules
    if (!config.externals) {
      config.externals = [];
    }
    config.externals.push('@sendgrid/mail');
    
    config.resolve.alias.canvas = false
    return config;
  }
};

module.exports = nextConfig; 