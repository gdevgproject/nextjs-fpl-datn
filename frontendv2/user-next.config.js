/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["elela.vn", "images.unsplash.com"],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

