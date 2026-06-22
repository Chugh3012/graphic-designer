import type { Project } from "@/payload-types";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { GalleryBlock } from "./GalleryBlock";
import { BeforeAfterBlock } from "./BeforeAfterBlock";

type ContentBlock = NonNullable<Project["contentBlocks"]>[number];

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="divide-y divide-stone-light/10">
      {blocks.map((block, index) => {
        const key = block.id || `block-${index}`;

        switch (block.blockType) {
          case "textBlock":
            return (
              <TextBlock
                key={key}
                heading={block.heading}
                body={block.body}
              />
            );

          case "imageBlock":
            return (
              <ImageBlock
                key={key}
                image={block.image}
                caption={block.caption}
                size={block.size}
              />
            );

          case "galleryBlock":
            return (
              <GalleryBlock
                key={key}
                heading={block.heading}
                images={block.images}
                columns={block.columns}
              />
            );

          case "beforeAfterBlock":
            return (
              <BeforeAfterBlock
                key={key}
                heading={block.heading}
                beforeImage={block.beforeImage}
                afterImage={block.afterImage}
                beforeLabel={block.beforeLabel}
                afterLabel={block.afterLabel}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
