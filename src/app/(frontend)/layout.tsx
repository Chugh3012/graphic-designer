import type { Metadata } from 'next'
import React from 'react'
import { inter, instrumentSerif } from '@/styles/fonts'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Portfolio | Branding & Packaging Designer',
    template: '%s | Portfolio',
  },
  description: 'Branding & packaging graphic designer specializing in brand identity, packaging design, and print materials.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
