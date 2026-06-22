import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import type { ProjectFull } from '@/lib/queries'

export function ProjectDetail({ project }: { project: ProjectFull }) {
  const { title, company, client, summary, brief, concept, keyConsiderations, gallery } = project
  const year = project.year ? String(project.year) : null

  const metaItems: { label: string; value: string }[] = []
  if (company) metaItems.push({ label: 'Agency', value: company })
  if (client) metaItems.push({ label: 'Client', value: client })
  if (year) metaItems.push({ label: 'Year', value: year })
  if (project.services.length > 0) metaItems.push({ label: 'Services', value: project.services.join(', ') })

  return (
    <article className="bg-cream">
      <div className="relative w-full aspect-video md:aspect-21/9 bg-cream-dark">
        <Image src={project.heroImage} alt={title} fill priority sizes="100vw" className="object-cover" />
      </div>

      <Container>
        <div className="py-16 md:py-24">
          {company && (
            <p className="font-sans text-xs tracking-widest uppercase text-stone mb-4">{company}</p>
          )}
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-charcoal mb-8">{title}</h1>
          {summary && (
            <p className="font-sans text-lg leading-relaxed text-charcoal-light max-w-2xl">{summary}</p>
          )}
        </div>
      </Container>

      {metaItems.length > 0 && (
        <div className="border-y border-stone-light/30">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
              {metaItems.map((item) => (
                <div key={item.label}>
                  <h4 className="font-sans text-xs tracking-widest uppercase text-stone mb-2">{item.label}</h4>
                  <p className="font-sans text-sm text-charcoal">{item.value}</p>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {(brief || keyConsiderations.length > 0) && (
        <Container>
          <div className="py-16 md:py-20 max-w-3xl">
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal mb-6">The Brief</h2>
            {brief && (
              <p className="font-sans text-base leading-relaxed text-charcoal-light mb-8">{brief}</p>
            )}
            {keyConsiderations.length > 0 && (
              <div>
                <h3 className="font-sans text-xs tracking-widest uppercase text-stone mb-4">Key Considerations</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  {keyConsiderations.map((item, i) => (
                    <li key={i} className="font-sans text-sm leading-relaxed text-charcoal-light pl-1">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </Container>
      )}

      {concept && (
        <div className="bg-cream-dark">
          <Container>
            <div className="py-16 md:py-20 max-w-3xl">
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal mb-6">Concept</h2>
              <p className="font-sans text-base leading-relaxed text-charcoal-light">{concept}</p>
            </div>
          </Container>
        </div>
      )}

      {gallery.length > 0 && (
        <Container>
          <div className="py-16 md:py-24 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {gallery.map((g, i) => (
              <figure key={i} className="overflow-hidden bg-cream-dark">
                <Image
                  src={g.src}
                  alt={g.caption || title}
                  width={1200}
                  height={900}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="w-full h-auto object-cover"
                />
                {g.caption && (
                  <figcaption className="font-sans text-xs text-stone mt-2 px-1">{g.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </Container>
      )}
    </article>
  )
}
