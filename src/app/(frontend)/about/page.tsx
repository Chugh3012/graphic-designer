import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Graphic designer with a focus on packaging and branding. Previously at Landor working on Gillette, Braun, and more.',
}

export default function AboutPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="font-serif text-5xl md:text-6xl mb-8">About</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <div className="aspect-3/4 bg-cream-dark rounded-lg" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-serif text-3xl mb-6">Hola!</h2>

            <div className="space-y-5">
              <p className="text-charcoal-light leading-relaxed">
                I&apos;m a graphic designer with a focus on packaging and branding,
                passionate about creating designs that are visually striking,
                meaningful, and built to connect. I believe great design brings
                stories to life and helps brands leave a lasting impression.
              </p>

              <p className="text-charcoal-light leading-relaxed">
                Most recently, I worked at <strong className="text-charcoal">Landor</strong>, where I
                had the opportunity to contribute to global brands like Gillette and
                Braun. I designed packaging for Gillette foam and Gillette Venus,
                created digital festive banners, and developed e-content for Braun.
                A standout project was the key visual for Gillette Japan, which was
                selected for worldwide use.
              </p>

              <p className="text-charcoal-light leading-relaxed">
                Before Landor, I worked at <strong className="text-charcoal">Dy works</strong> where I
                led packaging redesigns for brands like Kellogg&apos;s Muesli, Sugar Free
                D&apos;lite, and Vizylac, and crafted a complete brand identity for Nippo.
                I also contributed work during my time at <strong className="text-charcoal">Firebrand</strong>,
                creating illustration systems and visual assets.
              </p>

              <p className="text-charcoal-light leading-relaxed">
                My philosophy is a mix of <em>clean, clear &amp; something different</em>.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-stone-light/30">
              <h3 className="font-sans text-xs tracking-widest uppercase text-stone mb-4">
                Experience
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-sm text-charcoal">Landor</span>
                  <span className="font-sans text-xs text-stone">Graphic Designer</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-sm text-charcoal">Dy works</span>
                  <span className="font-sans text-xs text-stone">Graphic Designer</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-sans text-sm text-charcoal">Firebrand</span>
                  <span className="font-sans text-xs text-stone">Designer</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-stone-light/30">
              <h3 className="font-sans text-xs tracking-widest uppercase text-stone mb-4">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Packaging Design",
                  "Brand Identity",
                  "Key Visuals",
                  "E-commerce Content",
                  "Print Design",
                  "Illustration",
                  "Product Photography",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="font-sans text-xs tracking-wider px-3 py-1.5 bg-cream-dark rounded-full text-charcoal-light"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
