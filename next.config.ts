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
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
