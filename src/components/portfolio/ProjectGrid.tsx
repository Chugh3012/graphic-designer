"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

const categories = ["All", "Branding", "Packaging", "Print", "Identity"];

const placeholderProjects = [
  {
    title: "Botanica Brand Identity",
    slug: "botanica-brand-identity",
    heroImage: "/images/placeholder-1.jpg",
    categories: ["Branding", "Identity"],
  },
  {
    title: "Solstice Packaging",
    slug: "solstice-packaging",
    heroImage: "/images/placeholder-2.jpg",
    categories: ["Packaging", "Print"],
  },
  {
    title: "Meridian Studio Rebrand",
    slug: "meridian-studio-rebrand",
    heroImage: "/images/placeholder-3.jpg",
    categories: ["Branding", "Identity"],
  },
  {
    title: "Terre Print Collection",
    slug: "terre-print-collection",
    heroImage: "/images/placeholder-4.jpg",
    categories: ["Print", "Packaging"],
  },
  {
    title: "Lumiere Visual Identity",
    slug: "lumiere-visual-identity",
    heroImage: "/images/placeholder-5.jpg",
    categories: ["Branding", "Identity"],
  },
  {
    title: "Nomad Packaging System",
    slug: "nomad-packaging-system",
    heroImage: "/images/placeholder-6.jpg",
    categories: ["Packaging"],
  },
];

export function ProjectGrid() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return placeholderProjects;
    return placeholderProjects.filter((project) =>
      project.categories.includes(activeFilter)
    );
  }, [activeFilter]);

  return (
    <section className="py-24 md:py-32 bg-cream">
      <Container>
        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-16 pb-6 border-b border-stone-light/30">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveFilter(category)}
              className={`font-sans text-xs tracking-widest uppercase px-4 py-2 rounded-full transition-colors ${
                activeFilter === category
                  ? "bg-charcoal text-cream"
                  : "text-charcoal-light hover:text-charcoal hover:bg-cream-dark"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              title={project.title}
              slug={project.slug}
              heroImage={project.heroImage}
              categories={project.categories}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-sans text-stone text-sm">
              No projects found in this category.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
