import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { getFeaturedProjects } from "@/lib/queries";
import type { Media, ProjectCategory } from "@/payload-types";

function getImageUrl(media: number | Media | null | undefined): string {
  if (!media || typeof media === 'number') return '/images/placeholder-1.svg'
  return media.url || '/images/placeholder-1.svg'
}

function getCategoryNames(categories: (number | ProjectCategory)[] | null | undefined): string[] {
  if (!categories) return []
  return categories
    .map((cat) => (typeof cat === 'number' ? null : cat.name))
    .filter((name): name is string => !!name)
}

type FeaturedCard = {
  title: string
  slug: string
  heroImage: string
  categories: string[]
  company?: string
}

const fallbackProjects: FeaturedCard[] = [
  {
    title: "Gillette Onsen Japan KV",
    slug: "gillette-onsen-japan-kv",
    heroImage: "/images/placeholder-1.svg",
    categories: ["Key Visual"],
    company: "Landor",
  },
  {
    title: "Kellogg's Muesli",
    slug: "kelloggs-muesli",
    heroImage: "/images/placeholder-2.svg",
    categories: ["Packaging Design"],
    company: "Dy works",
  },
  {
    title: "Nippo Brand Identity",
    slug: "nippo",
    heroImage: "/images/placeholder-3.svg",
    categories: ["Brand Identity"],
    company: "Dy works",
  },
  {
    title: "Sugar Free D'lite",
    slug: "sugar-free-dlite",
    heroImage: "/images/placeholder-4.svg",
    categories: ["Packaging Design"],
    company: "Dy works",
  },
];

export async function FeaturedWork() {
  let projects: FeaturedCard[] = fallbackProjects;

  try {
    const featured = await getFeaturedProjects();
    if (featured.length > 0) {
      projects = featured.map((p) => ({
        title: p.title,
        slug: p.slug,
        heroImage: getImageUrl(p.heroImage),
        categories: getCategoryNames(p.categories),
        company: p.company ?? undefined,
      }));
    }
  } catch {
    // CMS unavailable — use fallback
  }

  return (
    <section className="py-24 md:py-32 bg-cream-dark">
      <Container>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-stone mb-3">
              Portfolio
            </p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-charcoal">
              Selected Work
            </h2>
          </div>
          <Link
            href="/work"
            className="hidden md:inline-flex font-sans text-sm tracking-widest uppercase text-charcoal-light hover:text-accent transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              title={project.title}
              slug={project.slug}
              heroImage={project.heroImage}
              categories={project.categories}
              company={project.company}
            />
          ))}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/work"
            className="font-sans text-sm tracking-widest uppercase text-charcoal-light hover:text-accent transition-colors"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </Container>
    </section>
  );
}
