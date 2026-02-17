import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

const featuredProjects = [
  {
    title: "Botanica Brand Identity",
    slug: "botanica-brand-identity",
    heroImage: "/images/placeholder-1.svg",
    categories: ["Branding", "Identity"],
  },
  {
    title: "Solstice Packaging",
    slug: "solstice-packaging",
    heroImage: "/images/placeholder-2.svg",
    categories: ["Packaging", "Print"],
  },
  {
    title: "Meridian Studio Rebrand",
    slug: "meridian-studio-rebrand",
    heroImage: "/images/placeholder-3.svg",
    categories: ["Branding", "Identity"],
  },
  {
    title: "Terre Print Collection",
    slug: "terre-print-collection",
    heroImage: "/images/placeholder-4.svg",
    categories: ["Print", "Packaging"],
  },
];

export function FeaturedWork() {
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
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              title={project.title}
              slug={project.slug}
              heroImage={project.heroImage}
              categories={project.categories}
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
