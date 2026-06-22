import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { Media } from "@/payload-types";

interface GalleryImage {
  image: number | Media;
  caption?: string | null;
  id?: string | null;
}

interface GalleryBlockProps {
  heading?: string | null;
  images?: GalleryImage[] | null;
  columns?: "2" | "3" | "4" | null;
}

function getImageUrl(media: number | Media | null | undefined): string {
  if (!media || typeof media === "number") return "/images/placeholder-1.svg";
  return media.url || "/images/placeholder-1.svg";
}

function getImageAlt(media: number | Media | null | undefined, fallback: string): string {
  if (!media || typeof media === "number") return fallback;
  return media.alt || fallback;
}

export function GalleryBlock({ heading, images, columns = "2" }: GalleryBlockProps) {
  if (!images || images.length === 0) return null;

  const colsClass = {
    "2": "grid-cols-1 md:grid-cols-2",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <Container>
      <div className="py-8 md:py-12">
        {heading && (
          <h3 className="font-serif text-xl md:text-2xl tracking-tight text-charcoal mb-8">
            {heading}
          </h3>
        )}
        <div className={`grid ${colsClass[columns || "2"]} gap-4 md:gap-6`}>
          {images.map((item, index) => {
            const imageUrl = getImageUrl(item.image);
            const imageAlt = getImageAlt(item.image, `Gallery image ${index + 1}`);

            return (
              <div
                key={item.id || index}
                className="relative aspect-4/3 bg-cream-dark rounded-sm overflow-hidden group"
              >
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes={
                    columns === "4"
                      ? "(max-width: 768px) 50vw, 25vw"
                      : columns === "3"
                        ? "(max-width: 768px) 100vw, 33vw"
                        : "(max-width: 768px) 100vw, 50vw"
                  }
                  className="object-cover"
                />
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-sans text-xs text-cream/90">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
