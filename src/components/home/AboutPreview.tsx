import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function AboutPreview() {
  return (
    <section className="py-24 md:py-32 bg-cream">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Placeholder */}
          <div className="relative aspect-[4/5] bg-cream-dark rounded-sm overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-sans text-sm text-stone tracking-widest uppercase">
                Portrait
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-stone mb-4">
              About
            </p>

            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-charcoal mb-8 leading-tight">
              Designing with
              <br />
              purpose &amp; care
            </h2>

            <div className="space-y-5 mb-10">
              <p className="font-sans text-base leading-relaxed text-charcoal-light">
                With over a decade of experience in visual design, I partner with
                brands who value craftsmanship and intentionality. Every project
                begins with understanding your story and ends with a design system
                that feels unmistakably yours.
              </p>
              <p className="font-sans text-base leading-relaxed text-charcoal-light">
                My approach blends strategic thinking with an eye for detail,
                creating identities that are both timeless and distinct.
              </p>
            </div>

            <Button href="/about" variant="secondary" size="md">
              More About Me
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
