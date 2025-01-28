/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/AIChat',
  assetPrefix: '/AIChat',
  trailingSlash: true,
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