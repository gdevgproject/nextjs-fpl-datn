/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["mybeauty.vn", "images.unsplash.com"],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

