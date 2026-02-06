/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add any external image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
}

module.exports = nextConfig

