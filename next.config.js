/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ['localhost', '.vercel.app', 'vercel.com', '21.0.13.48'],
};

module.exports = nextConfig;
