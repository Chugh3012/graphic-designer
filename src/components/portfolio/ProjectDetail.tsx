import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Container } from "@/components/ui/Container";
import type { Project, Media } from "@/payload-types";

interface ProjectDetailProps {
  project: Project;
}

// Helper to extract image URL from Media object or fallback
function getImageUrl(media: number | Media | null | undefined, fallback = "/images/placeholder-1.svg"): string {
  if (!media) return fallback;
  if (typeof media === "number") return fallback;
  return media.url || fallback;
}

// Helper to extract alt text from Media object
function getImageAlt(media: number | Media | null | undefined, fallback = ""): string {
  if (!media) return fallback;
  if (typeof media === "number") return fallback;
  return media.alt || fallback;
}

// Helper to normalize services array
function normalizeServices(services: { service?: string | null }[] | null | undefined): string[] {
  if (!services) return [];
  return services
    .map((item) => item.service)
    .filter((service): service is string => !!service);
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const title = project.title || "Untitled Project";
  const heroImageUrl = getImageUrl(project.heroImage);
  const heroImageAlt = getImageAlt(project.heroImage, title);
  const client = project.client || "Client Name";
  const year = project.year?.toString() || "2024";
  const services = normalizeServices(project.services);
  const description = project.summary || "";
  const content = project.content || null;
  const gallery = project.gallery || [];
  
  // Navigation properties (these would need to be passed from the page)
  const previousProject = (project as ProjectDetailProps["project"] & { previousProject?: { slug: string; title: string } | null }).previousProject || null;
  const nextProject = (project as ProjectDetailProps["project"] & { nextProject?: { slug: string; title: string } | null }).nextProject || null;

  return (
    <article className="bg-cream">
      {/* Hero Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-cream-dark">
        <Image
          src={heroImageUrl}
          alt={heroImageAlt}
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
      {gallery.length > 0 && (
        <Container>
          <div className="pb-16 md:pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {gallery.map((item, index) => {
                const imageUrl = getImageUrl(item.image);
                const imageAlt = getImageAlt(item.image, `Gallery image ${index + 1}`);
                const caption = item.caption || "";
                
                return (
                  <div
                    key={item.id || index}
                    className={`relative aspect-[4/3] bg-cream-dark rounded-sm overflow-hidden ${
                      index === 0 ? "md:col-span-2 md:aspect-[16/9]" : ""
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      sizes={
                        index === 0
                          ? "100vw"
                          : "(max-width: 768px) 100vw, 50vw"
                      }
                      className="object-cover"
                    />
                    {caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal/60 to-transparent">
                        <p className="font-sans text-xs text-cream/90">
                          {caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
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
