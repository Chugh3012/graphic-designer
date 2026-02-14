import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/queries'
import { ProjectDetail } from '@/components/portfolio/ProjectDetail'

type Props = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const slugs = await getAllProjectSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}

  return {
    title: project.seo?.metaTitle || project.title,
    description: project.seo?.metaDescription || project.summary,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  return <ProjectDetail project={project} />
}
