import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { Container } from "@/components/ui/Container";

interface ProjectDetailProps {
  project: {
    title?: string;
    slug?: string;
    heroImage?: string;
    client?: string;
    year?: string;
    services?: string[];
    description?: string;
    content?: SerializedEditorState | null;
    galleryImages?: { src: string; alt: string; caption?: string }[];
    previousProject?: { slug: string; title: string } | null;
    nextProject?: { slug: string; title: string } | null;
    [key: string]: unknown;
  };
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const {
    title = "Untitled Project",
    heroImage = "/images/placeholder-1.jpg",
    client = "Client Name",
    year = "2024",
    services = [],
    description = "",
    content = null,
    galleryImages = [],
    previousProject = null,
    nextProject = null,
  } = project;

  return (
    <article className="bg-cream">
      {/* Hero Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-cream-dark">
        <Image
          src={heroImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Project Header */}
      <Container>
        <div className="py-16 md:py-24">
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-charcoal mb-8">
            {title}
          </h1>

          {description && (
            <p className="font-sans text-lg leading-relaxed text-charcoal-light max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </Container>

      {/* Metadata Bar */}
      <div className="border-y border-stone-light/30">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            <div>
              <h4 className="font-sans text-xs tracking-widest uppercase text-stone mb-2">
                Client
              </h4>
              <p className="font-sans text-sm text-charcoal">{client}</p>
            </div>
            <div>
              <h4 className="font-sans text-xs tracking-widest uppercase text-stone mb-2">
                Year
              </h4>
              <p className="font-sans text-sm text-charcoal">{year}</p>
            </div>
            <div>
              <h4 className="font-sans text-xs tracking-widest uppercase text-stone mb-2">
                Services
              </h4>
              <p className="font-sans text-sm text-charcoal">
                {services.length > 0 ? services.join(", ") : "Design"}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Rich Content Area */}
      {content && (
        <Container>
          <div className="py-16 md:py-24 max-w-3xl">
            <RichText
              className="font-sans text-base leading-relaxed text-charcoal-light prose prose-headings:font-serif prose-headings:text-charcoal prose-a:text-accent"
              data={content}
            />
          </div>
        </Container>
      )}

      {/* Image Gallery Grid */}
      {galleryImages.length > 0 && (
        <Container>
          <div className="pb-16 md:pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative aspect-[4/3] bg-cream-dark rounded-sm overflow-hidden ${
                    index === 0 ? "md:col-span-2 md:aspect-[16/9]" : ""
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={
                      index === 0
                        ? "100vw"
                        : "(max-width: 768px) 100vw, 50vw"
                    }
                    className="object-cover"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal/60 to-transparent">
                      <p className="font-sans text-xs text-cream/90">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* Next / Previous Navigation */}
      <div className="border-t border-stone-light/30">
        <Container>
          <div className="grid grid-cols-2 py-12 md:py-16">
            {/* Previous */}
            <div className="text-left">
              {previousProject ? (
                <Link
                  href={`/work/${previousProject.slug}`}
                  className="group inline-block"
                >
                  <span className="font-sans text-xs tracking-widest uppercase text-stone block mb-2">
                    &larr; Previous
                  </span>
                  <span className="font-serif text-lg text-charcoal group-hover:text-accent transition-colors">
                    {previousProject.title}
                  </span>
                </Link>
              ) : (
                <div>
                  <span className="font-sans text-xs tracking-widest uppercase text-stone/40 block mb-2">
                    &larr; Previous
                  </span>
                </div>
              )}
            </div>

            {/* Next */}
            <div className="text-right">
              {nextProject ? (
                <Link
                  href={`/work/${nextProject.slug}`}
                  className="group inline-block"
                >
                  <span className="font-sans text-xs tracking-widest uppercase text-stone block mb-2">
                    Next &rarr;
                  </span>
                  <span className="font-serif text-lg text-charcoal group-hover:text-accent transition-colors">
                    {nextProject.title}
                  </span>
                </Link>
              ) : (
                <div>
                  <span className="font-sans text-xs tracking-widest uppercase text-stone/40 block mb-2">
                    Next &rarr;
                  </span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </article>
  );
}
