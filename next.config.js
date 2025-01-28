/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: '/AIChat',
  assetPrefix: '/AIChat',
  trailingSlash: true,
  experimental: {
    appDir: true
  },
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/AIChat/404',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 