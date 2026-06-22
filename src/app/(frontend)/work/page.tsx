import type { Metadata } from 'next'
import { getPublishedProjects, getProjectCategories } from '@/lib/queries'
import { ProjectGrid } from '@/components/portfolio/ProjectGrid'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Explore our portfolio of packaging, branding, and visual design projects.',
}

export default async function WorkPage() {
  let projects: { title: string; slug: string; heroImage: string; categories: string[]; company?: string }[] = []
  let categoryNames: string[] = []

  try {
    const [rawProjects, rawCategories] = await Promise.all([
      getPublishedProjects(),
      getProjectCategories(),
    ])

    projects = rawProjects.map((p) => ({ ...p, company: p.company || undefined }))
    categoryNames = rawCategories
  } catch {
    // CMS unavailable – fall through to fallback data in ProjectGrid
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="font-serif text-5xl md:text-6xl mb-4">Work</h1>
        <p className="text-stone text-lg mb-12 max-w-2xl">
          A curated selection of packaging, branding, and visual design projects.
        </p>
        <ProjectGrid
          projects={projects.length > 0 ? projects : undefined}
          categories={categoryNames.length > 0 ? categoryNames : undefined}
        />
      </div>
    </section>
  )
}
