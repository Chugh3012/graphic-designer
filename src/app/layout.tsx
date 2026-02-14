import type { Metadata } from 'next'
import { inter, instrumentSerif } from '@/styles/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Portfolio | Branding & Packaging Designer',
    template: '%s | Portfolio',
  },
  description: 'Branding & packaging graphic designer specializing in brand identity, packaging design, and print materials.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
