/**
 * Seed script to populate CMS with portfolio data and upload images to Azure.
 *
 * Usage:  npx tsx --tsconfig tsconfig.json scripts/seed.ts
 *
 * Requires: dev server NOT running (Payload opens its own DB connection).
 * Requires: docker-compose up -d (PostgreSQL on port 5433)
 */

/* ── Load environment variables ─────────────────────────── */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

/* ── resolve payload config (same alias as tsconfig) ─────── */

/* ── Constants ───────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PDF_OUTPUT = path.resolve(__dirname, '..', 'pdf-output')

/* ── Types ───────────────────────────────────────────────── */
interface CategoryDef {
  name: string
  slug: string
}

interface ImageRef {
  file: string      // relative to project folder inside pdf-output
  alt: string
}

interface GalleryBlockDef {
  blockType: 'galleryBlock'
  heading?: string
  columns?: string
  images: ImageRef[]
}

interface ImageBlockDef {
  blockType: 'imageBlock'
  image: ImageRef
  caption?: string
  size?: string
}

interface BeforeAfterBlockDef {
  blockType: 'beforeAfterBlock'
  heading?: string
  beforeImage: ImageRef
  afterImage: ImageRef
  beforeLabel?: string
  afterLabel?: string
}

interface TextBlockDef {
  blockType: 'textBlock'
  heading?: string
  bodyText?: string
}

type ContentBlockDef = GalleryBlockDef | ImageBlockDef | BeforeAfterBlockDef | TextBlockDef

interface ProjectDef {
  folder: string          // folder name in pdf-output
  title: string
  slug: string
  company: string
  client: string
  year?: number
  categories: string[]    // category slugs
  services: string[]
  summary: string
  brief?: string
  keyConsiderations?: string[]
  concept?: string
  heroImage: ImageRef
  contentBlocks: ContentBlockDef[]
  featured: boolean
  sortOrder: number
}

/* ── Categories ──────────────────────────────────────────── */
const CATEGORIES: CategoryDef[] = [
  { name: 'Packaging Design', slug: 'packaging-design' },
  { name: 'Brand Identity', slug: 'brand-identity' },
  { name: 'Key Visual', slug: 'key-visual' },
  { name: 'E-commerce Content', slug: 'e-commerce-content' },
  { name: 'Banner Design', slug: 'banner-design' },
  { name: 'Illustration', slug: 'illustration' },
  { name: 'Photography', slug: 'photography' },
]

/* ── Helper: build images list from folder ───────────────── */
function imagesFromFolder(folder: string, prefix: string): string[] {
  const dir = path.join(PDF_OUTPUT, folder)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f)).sort()
}

function imgRef(folder: string, file: string, alt: string): ImageRef {
  return { file: `${folder}/${file}`, alt }
}

/* ── Projects Data ───────────────────────────────────────── */
const PROJECTS: ProjectDef[] = [
  // ─── 1. Gillette Onsen Japan KV ───
  {
    folder: '01-gillette-onsen-japan-kv',
    title: 'Gillette Onsen Japan KV',
    slug: 'gillette-onsen-japan-kv',
    company: 'Landor',
    client: 'Gillette',
    year: 2024,
    categories: ['key-visual'],
    services: ['Key Visual Design', 'Art Direction', 'AI Exploration'],
    summary: 'Key Visual design for the Gillette Onsen Body Grooming Razor launch in Japan, blending Japanese bathing culture with modern grooming aesthetics.',
    brief: 'Develop a compelling Key Visual for the Gillette Onsen Body Grooming Razor launch in Japan. The KV should resonate with Japanese consumers by blending the cultural significance of the Onsen bathing tradition with Gillette\'s modern grooming technology.',
    keyConsiderations: [
      'Communicate body grooming as part of the broader Japanese grooming & bathing culture',
      'Position the Onsen razor as premium yet approachable, emphasizing comfort and safety',
      'Incorporate visual cues that evoke the Onsen experience — warm tones, steam, natural textures',
      'Ensure global brand consistency while being culturally relevant to the Japanese market',
    ],
    concept: 'The concept explores the intersection of traditional Japanese bathing rituals and modern grooming. AI-generated explorations were created to visualize the Onsen atmosphere — steam, warm water, natural stone — paired with the razor in a lifestyle setting that feels aspirational yet authentic.',
    heroImage: imgRef('01-gillette-onsen-japan-kv', 'page-06-img-02.jpeg', 'Gillette Onsen Japan Key Visual hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'AI Explorations',
        columns: '3',
        images: [
          imgRef('01-gillette-onsen-japan-kv', 'page-05-img-02.jpeg', 'Onsen AI exploration 1'),
          imgRef('01-gillette-onsen-japan-kv', 'page-06-img-01.jpeg', 'Onsen AI exploration 2'),
          imgRef('01-gillette-onsen-japan-kv', 'page-06-img-03.jpeg', 'Onsen AI exploration 3'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Final Key Visual Designs',
        columns: '2',
        images: [
          imgRef('01-gillette-onsen-japan-kv', 'page-07-img-01.jpeg', 'Gillette Onsen final KV 1'),
          imgRef('01-gillette-onsen-japan-kv', 'page-07-img-02.jpeg', 'Gillette Onsen final KV 2'),
          imgRef('01-gillette-onsen-japan-kv', 'page-07-img-03.jpeg', 'Gillette Onsen final KV 3'),
          imgRef('01-gillette-onsen-japan-kv', 'page-07-img-04.jpeg', 'Gillette Onsen final KV 4'),
        ],
      },
    ],
    featured: true,
    sortOrder: 1,
  },

  // ─── 2. Braun E-content ───
  {
    folder: '02-braun-e-content',
    title: 'Braun E-content (BT5, MGK & BT9)',
    slug: 'braun-e-content',
    company: 'Landor',
    client: 'Braun',
    year: 2024,
    categories: ['e-commerce-content'],
    services: ['E-commerce Design', 'Product Cards', 'A+ Content'],
    summary: 'Dynamic e-commerce content suite for Braun Trimmers — BT5, MGK and BT9 — designed for Amazon and retail platforms.',
    brief: 'Develop a compelling suite of dynamic e-commerce content for Braun Trimmers across three product ranges — BT5 Beard Trimmer, MGK Multi Grooming Kit, and BT9 Premium Beard Trimmer. The content needs to elevate the brand\'s online presence across Amazon and key retail platforms.',
    keyConsiderations: [
      'Create platform-optimized content that drives conversion — product cards, A+ content modules and brand stores',
      'Maintain visual consistency across the trimmer portfolio while differentiating each product\'s unique selling points',
      'Balance lifestyle imagery with clear product feature communication',
      'Design for both mobile-first and desktop experiences',
    ],
    heroImage: imgRef('02-braun-e-content', 'page-09-img-01.jpeg', 'Braun E-content hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'BT5: Product Cards',
        columns: '4',
        images: [
          imgRef('02-braun-e-content', 'page-10-img-01.jpeg', 'BT5 product card 1'),
          imgRef('02-braun-e-content', 'page-10-img-02.jpeg', 'BT5 product card 2'),
          imgRef('02-braun-e-content', 'page-10-img-03.jpeg', 'BT5 product card 3'),
          imgRef('02-braun-e-content', 'page-10-img-04.jpeg', 'BT5 product card 4'),
          imgRef('02-braun-e-content', 'page-10-img-05.jpeg', 'BT5 product card 5'),
          imgRef('02-braun-e-content', 'page-10-img-06.jpeg', 'BT5 product card 6'),
          imgRef('02-braun-e-content', 'page-10-img-07.jpeg', 'BT5 product card 7'),
          imgRef('02-braun-e-content', 'page-10-img-08.jpeg', 'BT5 product card 8'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'BT5: A+ Content',
        columns: '2',
        images: [
          imgRef('02-braun-e-content', 'page-11-img-01.jpeg', 'BT5 A+ content 1'),
          imgRef('02-braun-e-content', 'page-11-img-02.jpeg', 'BT5 A+ content 2'),
          imgRef('02-braun-e-content', 'page-11-img-03.jpeg', 'BT5 A+ content 3'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'MGK: Product Cards',
        columns: '4',
        images: [
          imgRef('02-braun-e-content', 'page-12-img-01.jpeg', 'MGK product card 1'),
          imgRef('02-braun-e-content', 'page-12-img-02.jpeg', 'MGK product card 2'),
          imgRef('02-braun-e-content', 'page-12-img-03.jpeg', 'MGK product card 3'),
          imgRef('02-braun-e-content', 'page-12-img-04.jpeg', 'MGK product card 4'),
          imgRef('02-braun-e-content', 'page-12-img-05.jpeg', 'MGK product card 5'),
          imgRef('02-braun-e-content', 'page-12-img-06.jpeg', 'MGK product card 6'),
          imgRef('02-braun-e-content', 'page-12-img-07.jpeg', 'MGK product card 7'),
          imgRef('02-braun-e-content', 'page-12-img-08.jpeg', 'MGK product card 8'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'MGK & BT9: A+ Content',
        columns: '2',
        images: [
          imgRef('02-braun-e-content', 'page-13-img-01.jpeg', 'MGK A+ content'),
          imgRef('02-braun-e-content', 'page-13-img-02.jpeg', 'BT9 A+ content'),
        ],
      },
    ],
    featured: true,
    sortOrder: 2,
  },

  // ─── 3. Gillette Venus Festive Banner ───
  {
    folder: '03-gillette-venus-festive-banner',
    title: 'Gillette Venus Festive Banner',
    slug: 'gillette-venus-festive-banner',
    company: 'Landor',
    client: 'Gillette',
    year: 2024,
    categories: ['banner-design'],
    services: ['Banner Design', 'Digital Advertising'],
    summary: 'Festive season banner campaign for Gillette Venus, designed for digital and social media platforms.',
    brief: 'Create a vibrant festive season banner campaign for Gillette Venus targeting the Indian market. The banners should celebrate the festive spirit while highlighting the Venus product range.',
    heroImage: imgRef('03-gillette-venus-festive-banner', 'page-15-img-01.jpeg', 'Gillette Venus festive banner hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Banner Designs',
        columns: '3',
        images: [
          imgRef('03-gillette-venus-festive-banner', 'page-16-img-01.jpeg', 'Venus festive banner 1'),
          imgRef('03-gillette-venus-festive-banner', 'page-16-img-02.jpeg', 'Venus festive banner 2'),
          imgRef('03-gillette-venus-festive-banner', 'page-16-img-03.jpeg', 'Venus festive banner 3'),
        ],
      },
    ],
    featured: false,
    sortOrder: 3,
  },

  // ─── 4. Kellogg's Muesli ───
  {
    folder: '04-kelloggs-muesli',
    title: "Kellogg's Muesli",
    slug: 'kelloggs-muesli',
    company: 'Dy works',
    client: "Kellogg's",
    year: 2023,
    categories: ['packaging-design'],
    services: ['Packaging Redesign', 'Brand Strategy', 'Structural Design'],
    summary: 'Complete packaging redesign for Kellogg\'s Muesli range with a farm-to-table breakfast concept emphasizing fresh, natural ingredients.',
    brief: 'Redesign the Kellogg\'s Muesli packaging to reposition the brand as a premium, natural breakfast choice. The new design should communicate freshness, wholesomeness, and the quality of ingredients.',
    keyConsiderations: [
      'Communicate natural, farm-fresh positioning through visual language',
      'Create a modular system that works across multiple SKUs and flavour variants',
      'Stand out on shelf against competitors while maintaining Kellogg\'s brand equity',
      'Ensure clear hierarchy: brand → sub-brand → flavour → nutritional claims',
    ],
    concept: 'Farm-to-table breakfast concept. The design centers on lush, overflowing imagery of real ingredients — nuts, fruits, grains — spilling naturally across the pack face, creating an abundant and appetizing visual. The colour palette shifts to earthy, warm tones that reinforce the natural positioning.',
    heroImage: imgRef('04-kelloggs-muesli', 'page-18-img-01.jpeg', 'Kellogg\'s Muesli packaging hero'),
    contentBlocks: [
      {
        blockType: 'imageBlock',
        image: imgRef('04-kelloggs-muesli', 'page-19-img-01.jpeg', 'Kellogg\'s Muesli concept board'),
        caption: 'Concept Board',
        size: 'full',
      },
      {
        blockType: 'galleryBlock',
        heading: 'Pack Elements & Design System',
        columns: '3',
        images: [
          imgRef('04-kelloggs-muesli', 'page-20-img-01.jpeg', 'Muesli pack element 1'),
          imgRef('04-kelloggs-muesli', 'page-20-img-02.jpeg', 'Muesli ingredient closeup'),
          imgRef('04-kelloggs-muesli', 'page-20-img-03.jpeg', 'Muesli ingredient 2'),
          imgRef('04-kelloggs-muesli', 'page-20-img-04.jpeg', 'Muesli ingredient 3'),
          imgRef('04-kelloggs-muesli', 'page-20-img-05.jpeg', 'Muesli pack detail'),
          imgRef('04-kelloggs-muesli', 'page-20-img-06.jpeg', 'Muesli ingredient detail'),
          imgRef('04-kelloggs-muesli', 'page-20-img-07.jpeg', 'Muesli pack element 2'),
          imgRef('04-kelloggs-muesli', 'page-20-img-08.jpeg', 'Muesli pack element 3'),
        ],
      },
      {
        blockType: 'beforeAfterBlock',
        heading: 'Front of Pack Redesign',
        beforeImage: imgRef('04-kelloggs-muesli', 'page-21-img-01.jpeg', 'Kellogg\'s Muesli previous FOP'),
        afterImage: imgRef('04-kelloggs-muesli', 'page-21-img-02.jpeg', 'Kellogg\'s Muesli current FOP'),
        beforeLabel: 'Previous FOP',
        afterLabel: 'Current FOP',
      },
      {
        blockType: 'beforeAfterBlock',
        heading: 'Back of Pack Redesign',
        beforeImage: imgRef('04-kelloggs-muesli', 'page-21-img-03.jpeg', 'Kellogg\'s Muesli previous BOP'),
        afterImage: imgRef('04-kelloggs-muesli', 'page-21-img-04.jpeg', 'Kellogg\'s Muesli current BOP'),
        beforeLabel: 'Previous BOP',
        afterLabel: 'Current BOP',
      },
      {
        blockType: 'galleryBlock',
        heading: 'Final Pack Range',
        columns: '3',
        images: [
          imgRef('04-kelloggs-muesli', 'page-22-img-01.jpeg', 'Muesli final pack 1'),
          imgRef('04-kelloggs-muesli', 'page-22-img-02.jpeg', 'Muesli final pack 2'),
          imgRef('04-kelloggs-muesli', 'page-23-img-01.jpeg', 'Muesli final pack 3'),
          imgRef('04-kelloggs-muesli', 'page-23-img-02.jpeg', 'Muesli final pack lineup'),
          imgRef('04-kelloggs-muesli', 'page-23-img-03.jpeg', 'Muesli final pack side'),
          imgRef('04-kelloggs-muesli', 'page-24-img-01.jpeg', 'Muesli shelf mockup'),
          imgRef('04-kelloggs-muesli', 'page-24-img-02.jpeg', 'Muesli pack render 1'),
          imgRef('04-kelloggs-muesli', 'page-24-img-03.jpeg', 'Muesli pack render 2'),
          imgRef('04-kelloggs-muesli', 'page-25-img-01.jpeg', 'Muesli pack lifestyle'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Banner Design',
        columns: '2',
        images: [
          imgRef('04-kelloggs-muesli', 'page-26-img-01.jpeg', 'Muesli banner design 1'),
          imgRef('04-kelloggs-muesli', 'page-26-img-02.jpeg', 'Muesli banner design 2'),
          imgRef('04-kelloggs-muesli', 'page-26-img-03.jpeg', 'Muesli banner design 3'),
        ],
      },
    ],
    featured: true,
    sortOrder: 4,
  },

  // ─── 5. Nippo Brand Identity ───
  {
    folder: '05-nippo',
    title: 'Nippo',
    slug: 'nippo',
    company: 'Dy works',
    client: 'Nippo',
    year: 2023,
    categories: ['brand-identity'],
    services: ['Brand Identity', 'Logo Design', 'Visual Language', 'Packaging', 'Iconography'],
    summary: 'Complete brand identity rebrand for Nippo batteries — from logo and colour system to visual language, iconography, packaging and digital applications.',
    brief: 'Rebrand Nippo from a traditional battery company to a modern, energetic consumer brand. The new identity must appeal to younger audiences while retaining recognition among loyal customers.',
    keyConsiderations: [
      'Modernize the brand while preserving recognition and trust built over decades',
      'Develop a distinctive visual language — the "Circle of Joy" — that communicates energy, positivity and everyday moments',
      'Create a scalable system that works across packaging, digital, retail and corporate touchpoints',
      'Design a comprehensive iconography set that supports product communication',
    ],
    concept: 'The "Circle of Joy" visual language. The rebrand introduces a radiant circular motif — representing energy radiating from the battery — paired with vibrant, joyful colours. The system is modular: the circles can be cropped, layered and combined to create endless variations across applications.',
    heroImage: imgRef('05-nippo', 'page-28-img-01.jpeg', 'Nippo brand identity hero'),
    contentBlocks: [
      {
        blockType: 'imageBlock',
        image: imgRef('05-nippo', 'page-28-img-02.jpeg', 'Nippo logo design'),
        caption: 'Logo Design',
        size: 'full',
      },
      {
        blockType: 'galleryBlock',
        heading: 'Colours & Visual Language',
        columns: '3',
        images: [
          imgRef('05-nippo', 'page-33-img-01.jpeg', 'Nippo colour palette'),
          imgRef('05-nippo', 'page-33-img-02.jpeg', 'Nippo visual language 1'),
          imgRef('05-nippo', 'page-33-img-03.jpeg', 'Nippo visual language 2'),
          imgRef('05-nippo', 'page-33-img-04.jpeg', 'Nippo visual language 3'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Iconography',
        columns: '4',
        images: [
          imgRef('05-nippo', 'page-33-img-09.jpeg', 'Nippo icon 1'),
          imgRef('05-nippo', 'page-33-img-10.jpeg', 'Nippo icon 2'),
          imgRef('05-nippo', 'page-33-img-11.jpeg', 'Nippo icon 3'),
          imgRef('05-nippo', 'page-33-img-14.jpeg', 'Nippo icon 4'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Applications — Brochure & Corporate',
        columns: '3',
        images: [
          imgRef('05-nippo', 'page-34-img-01.jpeg', 'Nippo brochure 1'),
          imgRef('05-nippo', 'page-34-img-03.jpeg', 'Nippo application 1'),
          imgRef('05-nippo', 'page-34-img-04.jpeg', 'Nippo application 2'),
          imgRef('05-nippo', 'page-34-img-05.jpeg', 'Nippo application 3'),
          imgRef('05-nippo', 'page-34-img-08.jpeg', 'Nippo corporate application'),
          imgRef('05-nippo', 'page-34-img-09.jpeg', 'Nippo stationery'),
          imgRef('05-nippo', 'page-34-img-10.jpeg', 'Nippo brand application'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Packaging & Retail',
        columns: '3',
        images: [
          imgRef('05-nippo', 'page-35-img-01.jpeg', 'Nippo packaging 1'),
          imgRef('05-nippo', 'page-35-img-02.jpeg', 'Nippo packaging 2'),
          imgRef('05-nippo', 'page-35-img-03.jpeg', 'Nippo packaging 3'),
          imgRef('05-nippo', 'page-35-img-04.jpeg', 'Nippo retail display'),
          imgRef('05-nippo', 'page-35-img-05.jpeg', 'Nippo packaging 4'),
          imgRef('05-nippo', 'page-35-img-06.jpeg', 'Nippo packaging 5'),
          imgRef('05-nippo', 'page-35-img-07.jpeg', 'Nippo packaging range'),
          imgRef('05-nippo', 'page-35-img-08.jpeg', 'Nippo packaging system'),
        ],
      },
    ],
    featured: true,
    sortOrder: 5,
  },

  // ─── 6. Sugar Free D'lite ───
  {
    folder: '06-sugar-free-dlite',
    title: "Sugar Free D'lite",
    slug: 'sugar-free-dlite',
    company: 'Dy works',
    client: 'Sugar Free',
    year: 2022,
    categories: ['packaging-design'],
    services: ['Packaging Design', 'Brand Architecture', 'System Design', 'Photography Direction'],
    summary: 'Complete packaging design system for Sugar Free D\'lite range spanning granola, chocolate, and beverage premixes — a guilt-free indulgence brand.',
    brief: 'Design a comprehensive packaging system for Sugar Free D\'lite, a new range of guilt-free indulgence products. The packaging must communicate "permissible indulgence" — delicious taste without the sugar — across multiple product categories.',
    keyConsiderations: [
      'Create a unified visual system that works across diverse categories — granola, chocolate, and beverages',
      'Communicate "guilt-free indulgence" without making it feel clinical or diet-focused',
      'Build a clear brand architecture that differentiates categories while maintaining range coherence',
      'Design for standout on shelf against both mainstream snacks and health-food brands',
    ],
    concept: 'The design system revolves around a rich, indulgent colour palette and appetite-driven photography. Each category gets a distinct colour territory while sharing structural design elements — the D\'lite wordmark, ingredient windows, and product photography style — creating a cohesive range.',
    heroImage: imgRef('06-sugar-free-dlite', 'page-37-img-01.jpeg', 'Sugar Free D\'lite packaging hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Concept Board & Explorations',
        columns: '3',
        images: [
          imgRef('06-sugar-free-dlite', 'page-39-img-01.jpeg', 'D\'lite concept 1'),
          imgRef('06-sugar-free-dlite', 'page-39-img-02.jpeg', 'D\'lite concept 2'),
          imgRef('06-sugar-free-dlite', 'page-39-img-03.jpeg', 'D\'lite concept 3'),
          imgRef('06-sugar-free-dlite', 'page-39-img-04.jpeg', 'D\'lite concept 4'),
          imgRef('06-sugar-free-dlite', 'page-39-img-05.jpeg', 'D\'lite concept 5'),
          imgRef('06-sugar-free-dlite', 'page-39-img-06.jpeg', 'D\'lite concept 6'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Architecture & System Design',
        columns: '2',
        images: [
          imgRef('06-sugar-free-dlite', 'page-42-img-01.jpeg', 'D\'lite architecture'),
          imgRef('06-sugar-free-dlite', 'page-43-img-01.jpeg', 'D\'lite system design 1'),
          imgRef('06-sugar-free-dlite', 'page-43-img-02.jpeg', 'D\'lite system design 2'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Category — Granola',
        columns: '2',
        images: [
          imgRef('06-sugar-free-dlite', 'page-44-img-01.jpeg', 'D\'lite granola 1'),
          imgRef('06-sugar-free-dlite', 'page-44-img-02.jpeg', 'D\'lite granola 2'),
          imgRef('06-sugar-free-dlite', 'page-44-img-03.jpeg', 'D\'lite granola 3'),
          imgRef('06-sugar-free-dlite', 'page-44-img-04.jpeg', 'D\'lite granola 4'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Category — Chocolate',
        columns: '3',
        images: [
          imgRef('06-sugar-free-dlite', 'page-45-img-01.jpeg', 'D\'lite chocolate 1'),
          imgRef('06-sugar-free-dlite', 'page-45-img-02.jpeg', 'D\'lite chocolate 2'),
          imgRef('06-sugar-free-dlite', 'page-45-img-03.jpeg', 'D\'lite chocolate 3'),
          imgRef('06-sugar-free-dlite', 'page-45-img-05.jpeg', 'D\'lite chocolate 4'),
          imgRef('06-sugar-free-dlite', 'page-45-img-10.jpeg', 'D\'lite chocolate 5'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Category — Beverage Premixes',
        columns: '3',
        images: [
          imgRef('06-sugar-free-dlite', 'page-46-img-01.jpeg', 'D\'lite beverage 1'),
          imgRef('06-sugar-free-dlite', 'page-46-img-02.jpeg', 'D\'lite beverage 2'),
          imgRef('06-sugar-free-dlite', 'page-46-img-03.jpeg', 'D\'lite beverage 3'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Full Range & Photography',
        columns: '2',
        images: [
          imgRef('06-sugar-free-dlite', 'page-48-img-01.jpeg', 'D\'lite full range'),
          imgRef('06-sugar-free-dlite', 'page-49-img-01.jpeg', 'D\'lite final photography'),
        ],
      },
    ],
    featured: true,
    sortOrder: 6,
  },

  // ─── 7. Vizylac ───
  {
    folder: '07-vizylac',
    title: 'Vizylac',
    slug: 'vizylac',
    company: 'Dy works',
    client: 'Vizylac',
    year: 2022,
    categories: ['packaging-design'],
    services: ['Packaging Design', 'Design Explorations'],
    summary: 'Packaging design explorations for Vizylac probiotic range — two comprehensive design directions presented with full range applications.',
    brief: 'Develop new packaging design for the Vizylac probiotic range. The redesign should modernize the brand\'s visual presence while communicating the health benefits of probiotics in an approachable, consumer-friendly way.',
    keyConsiderations: [
      'Communicate gut health benefits clearly without being overtly medicinal',
      'Create a distinctive shelf presence in the competitive probiotics category',
      'Develop a system that accommodates multiple product variants and formats',
      'Balance scientific credibility with consumer-friendly appeal',
    ],
    concept: 'Two distinct design directions were explored — each offering a unique visual approach to communicating probiotic health benefits while maintaining brand recognition and shelf impact.',
    heroImage: imgRef('07-vizylac', 'page-50-img-01.jpeg', 'Vizylac packaging hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Option 1',
        columns: '2',
        images: [
          imgRef('07-vizylac', 'page-51-img-01.jpeg', 'Vizylac option 1 pack 1'),
          imgRef('07-vizylac', 'page-51-img-02.jpeg', 'Vizylac option 1 pack 2'),
          imgRef('07-vizylac', 'page-53-img-01.jpeg', 'Vizylac option 1 detail'),
          imgRef('07-vizylac', 'page-54-img-01.jpeg', 'Vizylac option 1 range'),
          imgRef('07-vizylac', 'page-55-img-01.jpeg', 'Vizylac option 1 render 1'),
          imgRef('07-vizylac', 'page-56-img-01.jpeg', 'Vizylac option 1 render 2'),
          imgRef('07-vizylac', 'page-57-img-01.jpeg', 'Vizylac option 1 render 3'),
          imgRef('07-vizylac', 'page-58-img-01.jpeg', 'Vizylac option 1 variant 1'),
          imgRef('07-vizylac', 'page-58-img-02.jpeg', 'Vizylac option 1 variant 2'),
          imgRef('07-vizylac', 'page-59-img-01.jpeg', 'Vizylac option 1 application 1'),
          imgRef('07-vizylac', 'page-59-img-02.jpeg', 'Vizylac option 1 application 2'),
          imgRef('07-vizylac', 'page-60-img-01.jpeg', 'Vizylac option 1 shelf'),
          imgRef('07-vizylac', 'page-60-img-02.jpeg', 'Vizylac option 1 final'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Option 2',
        columns: '2',
        images: [
          imgRef('07-vizylac', 'page-61-img-01.png', 'Vizylac option 2 pack 1'),
          imgRef('07-vizylac', 'page-62-img-01.jpeg', 'Vizylac option 2 pack 2'),
          imgRef('07-vizylac', 'page-64-img-01.jpeg', 'Vizylac option 2 detail'),
          imgRef('07-vizylac', 'page-65-img-01.jpeg', 'Vizylac option 2 range'),
          imgRef('07-vizylac', 'page-66-img-01.jpeg', 'Vizylac option 2 render 1'),
          imgRef('07-vizylac', 'page-67-img-01.jpeg', 'Vizylac option 2 render 2'),
          imgRef('07-vizylac', 'page-68-img-01.jpeg', 'Vizylac option 2 render 3'),
          imgRef('07-vizylac', 'page-69-img-01.jpeg', 'Vizylac option 2 variant'),
          imgRef('07-vizylac', 'page-70-img-01.jpeg', 'Vizylac option 2 application'),
          imgRef('07-vizylac', 'page-71-img-01.jpeg', 'Vizylac option 2 final'),
        ],
      },
    ],
    featured: false,
    sortOrder: 7,
  },

  // ─── 8. Nature Fresh Oil ───
  {
    folder: '08-nature-fresh-oil',
    title: 'Nature Fresh Oil',
    slug: 'nature-fresh-oil',
    company: 'Dy works',
    client: 'Nature Fresh',
    year: 2022,
    categories: ['packaging-design'],
    services: ['Packaging Adaptation', 'Label Design'],
    summary: 'Packaging adaptation and label design for Nature Fresh cooking oil range — translating brand identity into shelf-ready packaging.',
    heroImage: imgRef('08-nature-fresh-oil', 'page-73-img-01.jpeg', 'Nature Fresh Oil hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Final Designs',
        columns: '2',
        images: [
          imgRef('08-nature-fresh-oil', 'page-73-img-01.jpeg', 'Nature Fresh pack 1'),
          imgRef('08-nature-fresh-oil', 'page-73-img-02.jpeg', 'Nature Fresh pack 2'),
          imgRef('08-nature-fresh-oil', 'page-73-img-03.jpeg', 'Nature Fresh pack 3'),
          imgRef('08-nature-fresh-oil', 'page-73-img-04.jpeg', 'Nature Fresh pack 4'),
        ],
      },
    ],
    featured: false,
    sortOrder: 8,
  },

  // ─── 9. Sugar Free D'lite Chocolate Spread ───
  {
    folder: '09-sugar-free-dlite-chocolate-spread',
    title: "Sugar Free D'lite Chocolate Spread",
    slug: 'sugar-free-dlite-chocolate-spread',
    company: 'Dy works',
    client: 'Sugar Free',
    year: 2022,
    categories: ['packaging-design'],
    services: ['Packaging Design', 'Photography Direction'],
    summary: 'Packaging design for Sugar Free D\'lite Chocolate Spread — extending the D\'lite brand into the spread category with indulgent, premium positioning.',
    brief: 'Extend the Sugar Free D\'lite brand into the chocolate spread category. The packaging must feel premium and indulgent while maintaining the D\'lite brand system and communicating the sugar-free benefit.',
    heroImage: imgRef('09-sugar-free-dlite-chocolate-spread', 'page-76-img-01.jpeg', 'D\'lite Chocolate Spread hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Design Explorations',
        columns: '2',
        images: [
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-74-img-01.jpeg', 'Chocolate spread exploration 1'),
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-75-img-01.jpeg', 'Chocolate spread exploration 2'),
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-75-img-02.jpeg', 'Chocolate spread exploration 3'),
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-75-img-03.jpeg', 'Chocolate spread exploration 4'),
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-75-img-04.jpeg', 'Chocolate spread exploration 5'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Final Design',
        columns: '2',
        images: [
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-76-img-01.jpeg', 'Chocolate spread final 1'),
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-76-img-02.jpeg', 'Chocolate spread final 2'),
          imgRef('09-sugar-free-dlite-chocolate-spread', 'page-77-img-01.jpeg', 'Chocolate spread lifestyle'),
        ],
      },
    ],
    featured: false,
    sortOrder: 9,
  },

  // ─── 10. Golden Terra Oil ───
  {
    folder: '10-golden-terra-oil',
    title: 'Golden Terra Oil, Nigeria',
    slug: 'golden-terra-oil',
    company: 'Dy works',
    client: 'Golden Terra',
    year: 2022,
    categories: ['packaging-design'],
    services: ['Packaging Design', 'Brand Identity'],
    summary: 'Complete packaging and brand identity design for Golden Terra cooking oil — a premium edible oil brand for the Nigerian market.',
    brief: 'Design packaging and brand identity for Golden Terra, a new premium cooking oil brand launching in the Nigerian market. The design must convey quality, trust, and natural goodness.',
    heroImage: imgRef('10-golden-terra-oil', 'page-81-img-01.jpeg', 'Golden Terra Oil hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Brand Identity & Packaging',
        columns: '2',
        images: [
          imgRef('10-golden-terra-oil', 'page-79-img-01.jpeg', 'Golden Terra design 1'),
          imgRef('10-golden-terra-oil', 'page-79-img-02.jpeg', 'Golden Terra design 2'),
          imgRef('10-golden-terra-oil', 'page-80-img-01.jpeg', 'Golden Terra packaging 1'),
          imgRef('10-golden-terra-oil', 'page-80-img-02.jpeg', 'Golden Terra packaging 2'),
          imgRef('10-golden-terra-oil', 'page-81-img-01.jpeg', 'Golden Terra final render'),
        ],
      },
    ],
    featured: false,
    sortOrder: 10,
  },

  // ─── 11. Musaji Tea ───
  {
    folder: '11-musaji-tea',
    title: 'Musaji Tea',
    slug: 'musaji-tea',
    company: 'Dy works',
    client: 'Musaji',
    year: 2021,
    categories: ['packaging-design'],
    services: ['Packaging Design', 'Range Extension'],
    summary: 'Packaging design for Musaji premium tea range — a heritage tea brand with a contemporary design approach.',
    brief: 'Redesign Musaji Tea\'s packaging to elevate the brand\'s premium positioning while honoring its heritage. The new packaging should appeal to modern consumers seeking quality tea experiences.',
    heroImage: imgRef('11-musaji-tea', 'page-83-img-04.jpeg', 'Musaji Tea packaging hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Design Explorations',
        columns: '3',
        images: [
          imgRef('11-musaji-tea', 'page-83-img-01.jpeg', 'Musaji tea exploration 1'),
          imgRef('11-musaji-tea', 'page-83-img-02.jpeg', 'Musaji tea exploration 2'),
          imgRef('11-musaji-tea', 'page-83-img-03.jpeg', 'Musaji tea exploration 3'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Final Range',
        columns: '3',
        images: [
          imgRef('11-musaji-tea', 'page-84-img-01.jpeg', 'Musaji tea final 1'),
          imgRef('11-musaji-tea', 'page-84-img-02.jpeg', 'Musaji tea final 2'),
          imgRef('11-musaji-tea', 'page-84-img-03.jpeg', 'Musaji tea final 3'),
          imgRef('11-musaji-tea', 'page-85-img-01.jpeg', 'Musaji tea pack 1'),
          imgRef('11-musaji-tea', 'page-85-img-02.jpeg', 'Musaji tea pack 2'),
          imgRef('11-musaji-tea', 'page-85-img-03.jpeg', 'Musaji tea pack 3'),
        ],
      },
    ],
    featured: false,
    sortOrder: 11,
  },

  // ─── 12. Better For You Illustrations ───
  {
    folder: '12-better-for-you-illustrations',
    title: 'Better For You, Illustrations',
    slug: 'better-for-you-illustrations',
    company: 'Firebrand',
    client: 'Better For You',
    year: 2023,
    categories: ['illustration'],
    services: ['Illustration', 'Visual Identity'],
    summary: 'Bespoke illustration suite for Better For You — a health and wellness brand. Custom-crafted illustrations that bring the brand\'s vision of healthy living to life.',
    brief: 'Create a distinctive suite of illustrations for Better For You, a health and wellness brand. The illustrations should be warm, inviting, and communicate the joy of healthy, mindful living.',
    heroImage: imgRef('12-better-for-you-illustrations', 'page-89-img-05.jpeg', 'Better For You illustrations hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Illustration Explorations',
        columns: '2',
        images: [
          imgRef('12-better-for-you-illustrations', 'page-87-img-01.jpeg', 'Better For You illustration 1'),
          imgRef('12-better-for-you-illustrations', 'page-87-img-02.jpeg', 'Better For You illustration 2'),
          imgRef('12-better-for-you-illustrations', 'page-87-img-03.jpeg', 'Better For You illustration 3'),
          imgRef('12-better-for-you-illustrations', 'page-87-img-04.jpeg', 'Better For You illustration 4'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Applications',
        columns: '3',
        images: [
          imgRef('12-better-for-you-illustrations', 'page-88-img-01.jpeg', 'Better For You application 1'),
          imgRef('12-better-for-you-illustrations', 'page-88-img-02.jpeg', 'Better For You application 2'),
          imgRef('12-better-for-you-illustrations', 'page-88-img-03.jpeg', 'Better For You application 3'),
        ],
      },
      {
        blockType: 'galleryBlock',
        heading: 'Final Illustrations',
        columns: '3',
        images: [
          imgRef('12-better-for-you-illustrations', 'page-89-img-01.jpeg', 'Better For You final 1'),
          imgRef('12-better-for-you-illustrations', 'page-89-img-02.jpeg', 'Better For You final 2'),
          imgRef('12-better-for-you-illustrations', 'page-89-img-03.jpeg', 'Better For You final 3'),
          imgRef('12-better-for-you-illustrations', 'page-89-img-04.jpeg', 'Better For You final 4'),
          imgRef('12-better-for-you-illustrations', 'page-89-img-05.jpeg', 'Better For You final 5'),
          imgRef('12-better-for-you-illustrations', 'page-89-img-06.jpeg', 'Better For You final 6'),
        ],
      },
    ],
    featured: false,
    sortOrder: 12,
  },

  // ─── 13. Photography ───
  {
    folder: '13-photography',
    title: 'Product Photography',
    slug: 'product-photography',
    company: 'Personal',
    client: 'Moi soi, Urban Platter, Smoor, Fabelle',
    year: 2023,
    categories: ['photography'],
    services: ['Product Photography', 'Food Photography', 'Styling'],
    summary: 'Product and food photography for premium brands — Moi soi, Urban Platter, Smoor and Fabelle. Clean, appetite-driven imagery that elevates each brand.',
    heroImage: imgRef('13-photography', 'page-91-img-05.jpeg', 'Product photography hero'),
    contentBlocks: [
      {
        blockType: 'galleryBlock',
        heading: 'Product Photography',
        columns: '3',
        images: [
          imgRef('13-photography', 'page-91-img-01.jpeg', 'Moi soi product shot'),
          imgRef('13-photography', 'page-91-img-02.jpeg', 'Urban Platter product shot'),
          imgRef('13-photography', 'page-91-img-03.jpeg', 'Smoor product shot'),
          imgRef('13-photography', 'page-91-img-04.jpeg', 'Fabelle product shot'),
          imgRef('13-photography', 'page-91-img-05.jpeg', 'Food photography composition'),
          imgRef('13-photography', 'page-91-img-06.jpeg', 'Product styling shot'),
        ],
      },
    ],
    featured: false,
    sortOrder: 13,
  },
]

export { CATEGORIES, PROJECTS }
export type { ProjectDef, CategoryDef, ImageRef, ContentBlockDef }
