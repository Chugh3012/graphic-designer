/**
 * One-time migration: portfolio data (scripts/portfolio-data.ts) + images
 * (pdf-output/) -> Keystatic content files (content/) + public/images/projects/.
 *
 * Run:  npm run migrate:content
 */
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { CATEGORIES, PROJECTS, type ImageRef, type ProjectDef } from './portfolio-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PDF_OUTPUT = path.join(ROOT, 'pdf-output')
const CONTENT = path.join(ROOT, 'content')
const IMG_DIR = path.join(ROOT, 'public', 'images', 'projects')

function ensureDir(d: string) {
  fs.mkdirSync(d, { recursive: true })
}
function writeJson(file: string, data: unknown) {
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

// Flatten every ImageRef referenced by a project, hero first, in order, deduped.
function projectImages(p: ProjectDef): ImageRef[] {
  const out: ImageRef[] = [p.heroImage]
  for (const block of p.contentBlocks) {
    if (block.blockType === 'galleryBlock') out.push(...block.images)
    else if (block.blockType === 'imageBlock') out.push(block.image)
    else if (block.blockType === 'beforeAfterBlock') out.push(block.beforeImage, block.afterImage)
  }
  const seen = new Set<string>()
  return out.filter((r) => (seen.has(r.file) ? false : (seen.add(r.file), true)))
}

// Copy an image to public/images/projects with a collision-safe flat name.
function copyImage(ref: ImageRef): string | null {
  const src = path.join(PDF_OUTPUT, ref.file)
  if (!fs.existsSync(src)) {
    console.warn(`   ⚠ missing: ${ref.file}`)
    return null
  }
  const dest = ref.file.replace(/[\\/]/g, '-')
  fs.copyFileSync(src, path.join(IMG_DIR, dest))
  return dest
}

function run() {
  ensureDir(IMG_DIR)
  let imageCount = 0

  console.log('Categories...')
  for (const c of CATEGORIES) {
    writeJson(path.join(CONTENT, 'categories', `${c.slug}.json`), { name: c.name })
  }

  console.log('Projects...')
  for (const p of PROJECTS) {
    const refs = projectImages(p)
    const copied = refs.map((r) => ({ ref: r, name: copyImage(r) })).filter((x) => x.name)
    imageCount += copied.length
    const hero = copied[0]
    const gallery = copied.slice(1).map((x) => ({ image: x.name as string, caption: x.ref.alt }))

    writeJson(path.join(CONTENT, 'projects', `${p.slug}.json`), {
      title: p.title,
      status: 'published',
      featured: p.featured,
      sortOrder: p.sortOrder,
      heroImage: hero?.name ?? null,
      categories: p.categories,
      company: p.company,
      client: p.client,
      year: p.year ?? null,
      services: p.services,
      summary: p.summary,
      brief: p.brief ?? '',
      concept: p.concept ?? '',
      keyConsiderations: p.keyConsiderations ?? [],
      gallery,
      seo: { metaTitle: '', metaDescription: p.summary },
    })
    console.log(`   ✓ ${p.slug} (${copied.length} images)`)
  }

  console.log('Singletons...')
  writeJson(path.join(CONTENT, 'settings', 'site.json'), {
    siteTitle: 'Anjali Nair',
    tagline: 'Graphic & Packaging Designer',
    instagram: '',
    behance: '',
    linkedin: '',
    dribbble: '',
    email: process.env.CONTACT_EMAIL_TO || '',
  })
  writeJson(path.join(CONTENT, 'settings', 'home.json'), {
    heroHeading: 'Design that tells a story',
    heroSubheading: 'Packaging, brand identity and key-visual design for brands that want to stand out.',
    ctaHeading: "Let's work together",
    ctaText: 'Have a project in mind? I would love to hear about it.',
    ctaButtonText: 'Get in touch',
    ctaButtonLink: '/contact',
  })
  // about is a markdoc singleton (frontmatter + body)
  ensureDir(path.join(CONTENT, 'settings'))
  fs.writeFileSync(
    path.join(CONTENT, 'settings', 'about.mdoc'),
    `---\nheading: About\nintro: Graphic and packaging designer with a passion for brands that tell a story.\n---\n\nI'm a graphic designer specialising in packaging design, brand identity and key-visual work. I have collaborated with agencies including Landor, Dy Works and Firebrand on brands such as Gillette, Braun and Kellogg's.\n`,
  )

  console.log(`\nDone. ${PROJECTS.length} projects, ${CATEGORIES.length} categories, ${imageCount} images.`)
}

run()
