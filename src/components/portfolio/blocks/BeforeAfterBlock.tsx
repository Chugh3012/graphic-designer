import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { Media } from "@/payload-types";

interface BeforeAfterBlockProps {
  heading?: string | null;
  beforeImage: number | Media;
  afterImage: number | Media;
  beforeLabel?: string | null;
  afterLabel?: string | null;
}

function getImageUrl(media: number | Media | null | undefined): string {
  if (!media || typeof media === "number") return "/images/placeholder-1.svg";
  return media.url || "/images/placeholder-1.svg";
}

function getImageAlt(media: number | Media | null | undefined, fallback: string): string {
  if (!media || typeof media === "number") return fallback;
  return media.alt || fallback;
}

export function BeforeAfterBlock({
  heading,
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterBlockProps) {
  const beforeUrl = getImageUrl(beforeImage);
  const afterUrl = getImageUrl(afterImage);
  const beforeAlt = getImageAlt(beforeImage, beforeLabel || "Before");
  const afterAlt = getImageAlt(afterImage, afterLabel || "After");

  return (
    <Container>
      <div className="py-8 md:py-12">
        {heading && (
          <h3 className="font-serif text-xl md:text-2xl tracking-tight text-charcoal mb-8">
            {heading}
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Before */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-stone mb-3">
              {beforeLabel}
            </p>
            <div className="relative aspect-4/3 bg-cream-dark rounded-sm overflow-hidden">
              <Image
                src={beforeUrl}
                alt={beforeAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          {/* After */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-stone mb-3">
              {afterLabel}
            </p>
            <div className="relative aspect-4/3 bg-cream-dark rounded-sm overflow-hidden">
              <Image
                src={afterUrl}
                alt={afterAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
