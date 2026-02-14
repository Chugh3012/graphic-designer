import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about our design process, philosophy, and the person behind the work.',
}

export default function AboutPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="font-serif text-5xl md:text-6xl mb-8">About</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <div className="aspect-[3/4] bg-cream-dark rounded-lg" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-serif text-3xl mb-6">Hello, I&apos;m a designer</h2>
            <p className="text-stone-light leading-relaxed mb-4">
              Content managed through the CMS admin panel.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
