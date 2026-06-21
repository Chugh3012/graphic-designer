"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/portfolio/ProjectCard";

interface ProjectData {
  title: string;
  slug: string;
  heroImage: string;
  categories: string[];
  company?: string;
}

interface ProjectGridProps {
  projects?: ProjectData[];
  categories?: string[];
}

const fallbackProjects: ProjectData[] = [
  {
    title: "Gillette Onsen Japan KV",
    slug: "gillette-onsen-japan-kv",
    heroImage: "/images/placeholder-1.svg",
    categories: ["Key Visual"],
    company: "Landor",
  },
  {
    title: "Braun E-content",
    slug: "braun-e-content",
    heroImage: "/images/placeholder-2.svg",
    categories: ["E-commerce Content"],
    company: "Landor",
  },
  {
    title: "Kellogg's Muesli",
    slug: "kelloggs-muesli",
    heroImage: "/images/placeholder-3.svg",
    categories: ["Packaging Design"],
    company: "Dy works",
  },
  {
    title: "Nippo Brand Identity",
    slug: "nippo",
    heroImage: "/images/placeholder-4.svg",
    categories: ["Brand Identity"],
    company: "Dy works",
  },
  {
    title: "Sugar Free D'lite",
    slug: "sugar-free-dlite",
    heroImage: "/images/placeholder-5.jpg",
    categories: ["Packaging Design"],
    company: "Dy works",
  },
  {
    title: "Vizylac",
    slug: "vizylac",
    heroImage: "/images/placeholder-6.jpg",
    categories: ["Packaging Design"],
    company: "Dy works",
  },
];

const fallbackCategories = [
  "All",
  "Packaging Design",
  "Brand Identity",
  "Key Visual",
  "E-commerce Content",
  "Banner Design",
  "Illustration",
  "Photography",
];

export function ProjectGrid({ projects, categories }: ProjectGridProps) {
  const displayProjects = projects && projects.length > 0 ? projects : fallbackProjects;
  const displayCategories = categories && categories.length > 0 ? ["All", ...categories] : fallbackCategories;

  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return displayProjects;
    return displayProjects.filter((project) =>
      project.categories.includes(activeFilter)
    );
  }, [activeFilter, displayProjects]);

  return (
    <section className="py-24 md:py-32 bg-cream">
      <Container>
        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-16 pb-6 border-b border-stone-light/30">
          {displayCategories.map((category) => (
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
              company={project.company}
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
