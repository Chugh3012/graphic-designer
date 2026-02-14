import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-accent">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-cream mb-6 leading-tight">
            Let&apos;s create something
            <br />
            beautiful together
          </h2>

          <p className="font-sans text-lg leading-relaxed text-cream/80 mb-10 max-w-lg mx-auto">
            Have a project in mind? I&apos;d love to hear about it. Let&apos;s
            discuss how we can bring your vision to life.
          </p>

          <Button href="/contact" variant="secondary" size="lg">
            Get in Touch
          </Button>
        </div>
      </Container>
    </section>
  );
}
