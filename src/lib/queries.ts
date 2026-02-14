/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Replace `any` types with auto-generated Payload types after running `npm run generate:types`
import { getPayloadClient } from './payload'

/**
 * Fetch published projects, optionally filtered by category slug.
 * Sorted by sortOrder (asc) then createdAt (desc).
 */
export async function getPublishedProjects(category?: string): Promise<any[]> {
  const payload = await getPayloadClient()

  const where: any = {
    status: { equals: 'published' },
  }

  if (category) {
    where['category.slug'] = { equals: category }
  }

  const { docs } = await payload.find({
    collection: 'projects',
    where,
    sort: 'sortOrder',
    limit: 100,
    depth: 2,
  })

  return docs
}

/**
 * Fetch published and featured projects, limited to 4.
 */
export async function getFeaturedProjects(): Promise<any[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'projects',
    where: {
      status: { equals: 'published' },
      featured: { equals: true },
    },
    sort: 'sortOrder',
    limit: 4,
    depth: 2,
  })

  return docs
}

/**
 * Fetch a single project by its slug. Returns the project or null.
 */
export async function getProjectBySlug(slug: string): Promise<any | null> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'projects',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })

  return docs[0] ?? null
}

/**
 * Fetch all published project slugs (for generateStaticParams).
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'projects',
    where: {
      status: { equals: 'published' },
    },
    limit: 1000,
    depth: 0,
  })

  return docs.map((doc: any) => doc.slug)
}

/**
 * Fetch all project categories sorted by name.
 */
export async function getProjectCategories(): Promise<any[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'project-categories',
    sort: 'name',
    limit: 100,
    depth: 0,
  })

  return docs
}

/**
 * Fetch the SiteSettings global.
 */
export async function getSiteSettings(): Promise<any> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })
}

/**
 * Fetch the HomePage global.
 */
export async function getHomePage(): Promise<any> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'home-page',
    depth: 2,
  })
}

/**
 * Fetch the Navigation global.
 */
export async function getNavigation(): Promise<any> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'navigation',
    depth: 1,
  })
}

/**
 * Fetch the Footer global.
 */
export async function getFooter(): Promise<any> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'footer',
    depth: 1,
  })
}
