import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { Media } from "@/payload-types";

interface ImageBlockProps {
  image: number | Media;
  caption?: string | null;
  size?: "full" | "medium" | "small" | null;
}

function getImageUrl(media: number | Media | null | undefined): string {
  if (!media || typeof media === "number") return "/images/placeholder-1.svg";
  return media.url || "/images/placeholder-1.svg";
}

function getImageAlt(media: number | Media | null | undefined): string {
  if (!media || typeof media === "number") return "";
  return media.alt || "";
}

export function ImageBlock({ image, caption, size = "full" }: ImageBlockProps) {
  const imageUrl = getImageUrl(image);
  const imageAlt = getImageAlt(image);

  const sizeClasses = {
    full: "max-w-full",
    medium: "max-w-4xl mx-auto",
    small: "max-w-2xl mx-auto",
  };

  return (
    <Container>
      <div className={`py-6 md:py-8 ${sizeClasses[size || "full"]}`}>
        <div className="relative aspect-video bg-cream-dark rounded-sm overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes={size === "full" ? "100vw" : size === "medium" ? "80vw" : "60vw"}
            className="object-cover"
          />
        </div>
        {caption && (
          <p className="font-sans text-xs text-stone mt-3 text-center">
            {caption}
          </p>
        )}
      </div>
    </Container>
  );
}
