import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { Container } from "@/components/ui/Container";

interface TextBlockProps {
  heading?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: SerializedEditorState | any | null;
}

export function TextBlock({ heading, body }: TextBlockProps) {
  if (!heading && !body) return null;

  return (
    <Container>
      <div className="py-12 md:py-16 max-w-3xl">
        {heading && (
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal mb-6">
            {heading}
          </h2>
        )}
        {body && (
          <RichText
            className="font-sans text-base leading-relaxed text-charcoal-light prose prose-headings:font-serif prose-headings:text-charcoal prose-a:text-accent"
            data={body}
          />
        )}
      </div>
    </Container>
  );
}
