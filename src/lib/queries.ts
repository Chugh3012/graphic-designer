import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'

// Reads content files at build time → fully static pages. No DB, no server.
const reader = createReader(process.cwd(), keystaticConfig)

function img(v: string | null | undefined): string {
  if (!v) return '/images/placeholder-1.svg'
  return v.startsWith('/') ? v : `/images/projects/${v}`
}

export interface ProjectSummary {
  title: string
  slug: string
  heroImage: string
  categories: string[]
  company: string
}

export interface ProjectFull extends ProjectSummary {
  client: string
  year?: number
  services: string[]
  summary: string
  brief: string
  concept: string
  keyConsiderations: string[]
  gallery: { src: string; caption: string }[]
  metaTitle: string
  metaDescription: string
}

type ProjectEntry = NonNullable<Awaited<ReturnType<typeof reader.collections.projects.read>>>

let nameCache: Map<string, string> | null = null
async function categoryMap(): Promise<Map<string, string>> {
  if (nameCache) return nameCache
  const cats = await reader.collections.categories.all()
  nameCache = new Map(cats.map((c) => [c.slug, c.entry.name]))
  return nameCache
}

function toSummary(slug: string, e: ProjectEntry, names: Map<string, string>): ProjectSummary {
  return {
    title: e.title,
    slug,
    heroImage: img(e.heroImage),
    categories: (e.categories ?? []).map((s) => names.get(s as string) ?? (s as string)),
    company: e.company ?? '',
  }
}

async function publishedSorted() {
  const all = await reader.collections.projects.all()
  return all
    .filter((p) => p.entry.status === 'published')
    .sort((a, b) => (a.entry.sortOrder ?? 0) - (b.entry.sortOrder ?? 0))
}

export async function getPublishedProjects(category?: string): Promise<ProjectSummary[]> {
  const [items, names] = await Promise.all([publishedSorted(), categoryMap()])
  const summaries = items.map((p) => toSummary(p.slug, p.entry, names))
  if (category) return summaries.filter((s) => s.categories.includes(category))
  return summaries
}

export async function getFeaturedProjects(): Promise<ProjectSummary[]> {
  const [items, names] = await Promise.all([publishedSorted(), categoryMap()])
  return items
    .filter((p) => p.entry.featured)
    .slice(0, 4)
    .map((p) => toSummary(p.slug, p.entry, names))
}

export async function getProjectBySlug(slug: string): Promise<ProjectFull | null> {
  const [entry, names] = await Promise.all([reader.collections.projects.read(slug), categoryMap()])
  if (!entry || entry.status !== 'published') return null
  return {
    ...toSummary(slug, entry, names),
    client: entry.client ?? '',
    year: entry.year ?? undefined,
    services: [...(entry.services ?? [])],
    summary: entry.summary ?? '',
    brief: entry.brief ?? '',
    concept: entry.concept ?? '',
    keyConsiderations: [...(entry.keyConsiderations ?? [])],
    gallery: (entry.gallery ?? []).map((g) => ({ src: img(g.image), caption: g.caption ?? '' })),
    metaTitle: entry.seo?.metaTitle || entry.title,
    metaDescription: entry.seo?.metaDescription || entry.summary || '',
  }
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const items = await publishedSorted()
  return items.map((p) => p.slug)
}

export async function getProjectCategories(): Promise<string[]> {
  const cats = await reader.collections.categories.all()
  return cats.map((c) => c.entry.name).sort()
}

export async function getSiteSettings() {
  return reader.singletons.siteSettings.read()
}

export async function getHomePage() {
  return reader.singletons.homePage.read()
}
