import type { Metadata } from 'next'
import { ProjectGrid } from '@/components/portfolio/ProjectGrid'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Explore our portfolio of branding, packaging, and print design projects.',
}

export default function WorkPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="font-serif text-5xl md:text-6xl mb-4">Our Work</h1>
        <p className="text-stone text-lg mb-12 max-w-2xl">
          A curated selection of branding, packaging, and print design projects.
        </p>
        <ProjectGrid />
      </div>
    </section>
  )
}
