import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'qpay.mn' },
      { protocol: 'https', hostname: 'merchant.qpay.mn' },
    ],
  },
}

export default nextConfig
