import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@azure/monitor-opentelemetry',
    '@opentelemetry/sdk-node',
    '@opentelemetry/instrumentation',
  ],
  async rewrites() {
    return [
      {
        source: '/images/placeholder-1.jpg',
        destination: '/images/placeholder-1.svg',
      },
      {
        source: '/images/placeholder-2.jpg',
        destination: '/images/placeholder-2.svg',
      },
      {
        source: '/images/placeholder-3.jpg',
        destination: '/images/placeholder-3.svg',
      },
      {
        source: '/images/placeholder-4.jpg',
        destination: '/images/placeholder-4.svg',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: '*.azureedge.net',
      },
      {
        protocol: 'https',
        hostname: '*.azurefd.net',
      },
    ],
  },
}

export default withPayload(nextConfig)
