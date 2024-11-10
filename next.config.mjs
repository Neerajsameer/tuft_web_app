/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/meeting/:meeting_id',
        destination: '/meeting/:meeting_id',
      },
      {
        source: '/:any*',
        destination: '/dashboard',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.tuft.in',
      },
    ],
  },
};

export default nextConfig;
