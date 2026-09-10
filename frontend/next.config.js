/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/coming-soon',
        permanent: false,
      },
      {
        source: '/sign-up',
        destination: '/coming-soon',
        permanent: false,
      },
      {
        source: '/auth/register',
        destination: '/coming-soon',
        permanent: false,
      },
    ];
  },
}


module.exports = nextConfig

