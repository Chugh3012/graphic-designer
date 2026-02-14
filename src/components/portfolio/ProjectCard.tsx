"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ProjectCardProps {
  title: string;
  slug: string;
  heroImage: string;
  categories: string[];
}

export function ProjectCard({
  title,
  slug,
  heroImage,
  categories,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/work/${slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-cream-dark">
        <Image
          src={heroImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-700 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-charcoal/40 flex items-center justify-center transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-sans text-xs tracking-widest uppercase text-cream border border-cream/60 px-5 py-2.5">
            View Project
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-5">
        <h3 className="font-serif text-xl text-charcoal group-hover:text-accent transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-3 mt-2">
          {categories.map((category) => (
            <span
              key={category}
              className="font-sans text-xs tracking-wider uppercase text-stone"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
