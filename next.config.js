/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/ai-chat',
  assetPrefix: '/ai-chat',
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/ai-chat/404',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 