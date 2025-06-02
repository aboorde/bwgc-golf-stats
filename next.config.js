/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bwgc-golf-stats' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/bwgc-golf-stats' : '',
}

module.exports = nextConfig