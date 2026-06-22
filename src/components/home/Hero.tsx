import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-cream">
      <Container>
        <div className="max-w-3xl py-32 md:py-0">
          <p className="font-sans text-sm tracking-widest uppercase text-stone mb-6">
            Graphic Designer &mdash; Packaging &amp; Branding
          </p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-charcoal mb-8">
            Clean, clear &amp;
            <br />
            something different
          </h1>

          <p className="font-sans text-lg md:text-xl leading-relaxed text-charcoal-light max-w-xl mb-12">
            I&apos;m a graphic designer with a focus on packaging and branding,
            passionate about creating designs that are visually striking,
            meaningful, and built to connect.
          </p>

          <Button href="/work" variant="primary" size="lg">
            View Selected Work
          </Button>
        </div>
      </Container>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-sans text-xs tracking-widest uppercase text-stone">
          Scroll
        </span>
        <div className="w-px h-12 bg-stone/40" />
      </div>
    </section>
  );
}
