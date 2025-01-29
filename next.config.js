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
  async headers() {
    return [
      {
        source: '/AIChat/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
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