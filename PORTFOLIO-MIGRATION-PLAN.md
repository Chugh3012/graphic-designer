# Portfolio Migration Plan

## PDF Analysis Summary

**92-page portfolio containing 13 projects** across 3 agencies + personal work.

### Portfolio Structure

| # | Pages | Project | Agency | Type |
|---|-------|---------|--------|------|
| 1 | 4–7 | Gillette Onsen Japan KV | Landor | Key Visual Design |
| 2 | 8–13 | Braun E-content (BT5, MGK & BT9) | Landor | E-commerce Content |
| 3 | 14–16 | Gillette Venus Festive Banner | Landor | Banner Design |
| 4 | 17–26 | Kellogg's Muesli | Dy works | Packaging Redesign |
| 5 | 27–35 | Nippo | Dy works | Brand Identity / Rebrand |
| 6 | 36–49 | Sugar Free D'lite | Dy works | Packaging Design |
| 7 | 50–71 | Vizylac | Dy works | Packaging Design |
| 8 | 72–73 | Nature Fresh Oil | Dy works | Packaging Adaptation |
| 9 | 74–77 | Sugar Free D'lite Chocolate Spread | Dy works | Packaging Design |
| 10 | 78–81 | Golden Terra Oil, Nigeria | Dy works | Packaging Design |
| 11 | 82–85 | Musaji Tea | Dy works | Packaging Design |
| 12 | 86–89 | Better For You, Illustrations | Firebrand | Illustration |
| 13 | 90–91 | Photography (Moi soi, Urban Platter, Smoor, Fabelle) | Personal | Product Photography |

### Key Content Patterns Found in PDF

Each project follows a recurring structure:
1. **Title slide** — "PROJECT N: Agency | Project Name" (text-only divider)
2. **Brief** — Design brief paragraph + numbered "Key Considerations" list
3. **Concept / Process** — Concept narrative, explorations, moodboards (text + images)
4. **Design Sections** — Grouped work pages with section headings like "BT5: Product Cards", "Option 1/2", "Before/After", "Logo", "Colours", "Visual Language", etc.
5. **Final Designs** — Image-heavy showcase pages (mostly image-only)

### Bio & Personal Branding (Pages 1–2)
- **Philosophy/tagline**: "My philosophy is a mix of clean, clear & something different"
- **Bio**: Graphic designer focused on packaging and branding. Worked at Landor (Gillette, Braun), previously at Dy works. Passionate about designs that are visually striking, meaningful, and built to connect.

---

## Gap Analysis: Current Website vs Portfolio

### What the current site has
- Simple flat `gallery` (array of image + caption)
- A single `content` richText field 
- A `summary` textarea
- `client` and `year` fields
- Hardcoded placeholder projects and categories ("Branding", "Packaging", "Print", "Identity")
- Generic Hero text and About page copy
- `ProjectDetail` component: Hero image → Title/Summary → Metadata bar → RichText → Flat gallery

### What the portfolio needs
- **Structured brief** with "Key Considerations" as a distinct UI section
- **Sectioned gallery** — images grouped under headings like "Product Cards", "A+ Content", "Option 1", "Logo", "Colours", "Final Design"
- **Company/Agency** field (Landor, Dy works, Firebrand, Personal) — different from `client` (client = the brand like Gillette, Kellogg's)
- **Concept/Process narrative** — separate from the brief, explaining the design approach
- **Multiple content blocks** — the portfolio alternates text and image sections freely (not just richText → gallery)
- Real categories: Packaging Design, Brand Identity, Key Visual, E-commerce Content, Illustration, Photography

---

## Implementation Plan

### Phase 1: CMS Schema Changes

#### 1.1 Update Projects Collection (`src/collections/Projects.ts`)

Add new fields to support the portfolio structure:

```
company          text        — Agency name (Landor, Dy works, Firebrand, Personal)
brief            textarea    — Project brief text
keyConsiderations array[text] — Numbered list of key considerations  
concept          textarea    — Concept/process narrative
```

Replace the flat `gallery` with a **sectioned content blocks** approach using a `blocks` field:

```
contentBlocks    blocks[
  - textBlock:     { heading: text, body: richText }
  - imageBlock:    { image: upload, caption: text, size: select[full/half] }
  - galleryBlock:  { heading: text, images: array[{image, caption}], layout: select[grid/masonry/full-width] }
  - beforeAfterBlock: { heading: text, beforeImage: upload, afterImage: upload, beforeLabel: text, afterLabel: text }
]
```

This replaces the current `content` richText and `gallery` array with a flexible block-based system that matches how the portfolio actually presents work.

#### 1.2 Update Categories
Replace hardcoded categories with real ones derived from the portfolio:
- Packaging Design
- Brand Identity  
- Key Visual
- E-commerce Content
- Banner Design
- Illustration
- Photography

These will be seeded in the CMS.

### Phase 2: Project Detail Page Redesign

#### 2.1 Update `ProjectDetail` component (`src/components/portfolio/ProjectDetail.tsx`)

New layout structure to match portfolio flow:

```
┌─────────────────────────────────────┐
│          HERO IMAGE (full-width)    │
├─────────────────────────────────────┤
│  Project Title                      │
│  Company / Client / Year / Services │
├─────────────────────────────────────┤
│  THE BRIEF                          │
│  Brief text paragraph               │
│  Key Considerations:                │
│  1. ...                             │
│  2. ...                             │
│  3. ...                             │
├─────────────────────────────────────┤
│  CONCEPT (if present)               │
│  Concept narrative text             │
├─────────────────────────────────────┤
│  Content Blocks (dynamic):          │
│  ┌─ Text Block ─────────────────┐   │
│  │ Section heading + body text  │   │
│  └──────────────────────────────┘   │
│  ┌─ Gallery Block ──────────────┐   │
│  │ Section heading              │   │
│  │ ┌─────┐  ┌─────┐  ┌─────┐  │   │
│  │ │ img │  │ img │  │ img │  │   │
│  │ └─────┘  └─────┘  └─────┘  │   │
│  └──────────────────────────────┘   │
│  ┌─ Before/After Block ─────────┐   │
│  │ Before label    After label  │   │
│  │ ┌─────────┐  ┌─────────┐    │   │
│  │ │ before  │  │ after   │    │   │
│  │ └─────────┘  └─────────┘    │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│  ← Previous         Next →         │
└─────────────────────────────────────┘
```

#### 2.2 New Block Renderer Components

Create reusable components for each content block type:
- `ContentBlockRenderer.tsx` — Dispatches to the right block component
- `TextBlock.tsx` — Heading + richText body
- `GalleryBlock.tsx` — Section heading + image grid with layout options
- `ImageBlock.tsx` — Single image with caption (full-width or half-width)
- `BeforeAfterBlock.tsx` — Side-by-side comparison

### Phase 3: Homepage & About Page Updates

#### 3.1 Hero Section
Update default content to match the portfolio's voice:
- Tagline: "My philosophy is a mix of clean, clear & something different"  
- Bio snippet about packaging/branding focus

#### 3.2 About Page (`src/app/(frontend)/about/page.tsx`)
Populate with actual bio content from page 2:
- Packaging and branding focus
- Landor experience (Gillette, Braun)
- Design philosophy

#### 3.3 Featured Work
Update from hardcoded placeholders to use CMS `getFeaturedProjects()` query (already exists but not wired up).

### Phase 4: Work Listing Page Updates

#### 4.1 Update `ProjectGrid` component
- Replace hardcoded placeholder projects with CMS data (query already exists)
- Replace hardcoded categories with dynamic categories from CMS
- Add `company` as an additional filter dimension (group by agency)

#### 4.2 Update `ProjectCard` 
- Show company/agency name alongside categories
- Keep the clean hover effect, add subtle company badge

### Phase 5: Image Extraction & Content Population

#### 5.1 Extract Images from PDF
Use Python (PyMuPDF) to extract all images from the 92-page PDF, organized by project:
```
pdf-output/
  project-01-gillette-onsen/
    page-05-img-01.png
    page-06-img-01.png
    ...
  project-02-braun-econtent/
    ...
```

#### 5.2 Create Seed Script
Build a script/documentation that maps extracted images + text content to each project for easy CMS population:
- Project metadata (title, slug, client, company, year, services)
- Brief text + key considerations
- Concept text
- Content blocks with image assignments

---

## Execution Order

| Step | Task | Effort |
|------|------|--------|
| 1 | Update Projects collection schema (add fields + blocks) | Medium |
| 2 | Run `generate:types` to update TypeScript types | Quick |
| 3 | Create block renderer components | Medium |
| 4 | Redesign `ProjectDetail` component | Medium |
| 5 | Update `ProjectGrid` to use CMS data + real categories | Small |
| 6 | Update Hero content and About page with portfolio bio | Small |
| 7 | Wire up `FeaturedWork` to use CMS query | Small |
| 8 | Extract images from PDF into organized folders | Medium |
| 9 | Document content mapping for CMS entry | Medium |

### Dependencies
- Steps 2–4 depend on Step 1 (schema must be updated first)
- Steps 3–4 are related (block components needed for ProjectDetail)
- Steps 5–7 are independent of each other
- Steps 8–9 can run in parallel with code changes

---

## Content Block Field Design (Detailed)

```typescript
// New blocks field for Projects collection
{
  name: 'contentBlocks',
  type: 'blocks',
  blocks: [
    {
      slug: 'textBlock',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      slug: 'imageBlock', 
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
        { name: 'size', type: 'select', options: ['full', 'medium', 'small'], defaultValue: 'full' },
      ],
    },
    {
      slug: 'galleryBlock',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'images', type: 'array', fields: [
          { name: 'image', type: 'upload', relationTo: 'media', required: true },
          { name: 'caption', type: 'text' },
        ]},
        { name: 'columns', type: 'select', options: ['2', '3', '4'], defaultValue: '2' },
      ],
    },
    {
      slug: 'beforeAfterBlock',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'beforeImage', type: 'upload', relationTo: 'media', required: true },
        { name: 'afterImage', type: 'upload', relationTo: 'media', required: true },
        { name: 'beforeLabel', type: 'text', defaultValue: 'Before' },
        { name: 'afterLabel', type: 'text', defaultValue: 'After' },
      ],
    },
  ],
}
```

## Real Project Data Mapping

Here's how each portfolio project maps to the new schema:

### Project 1: Gillette Onsen Japan KV
- **Company**: Landor
- **Client**: Gillette
- **Categories**: Key Visual
- **Brief**: "Develop a compelling Key Visual for the Gillette Onsen Body Grooming Razor launch..."
- **Key Considerations**: 4 items about body grooming messaging, safety, Japanese aesthetic, global reach
- **Content Blocks**: textBlock (AI explorations narrative) → galleryBlock (shortlisted explorations) → galleryBlock (final KV designs)

### Project 2: Braun E-content
- **Company**: Landor
- **Client**: Braun
- **Categories**: E-commerce Content
- **Brief**: "Develop a compelling suite of dynamic e-commerce content for Braun Trimmers..."
- **Content Blocks**: galleryBlock("BT5: Product Cards") → galleryBlock("BT5: A+ Content") → galleryBlock("MGK: Product Cards") → galleryBlock("MGK: A+ Content")

### Project 3: Gillette Venus Festive Banner
- **Company**: Landor
- **Client**: Gillette
- **Categories**: Banner Design
- **Content Blocks**: textBlock(brief) → galleryBlock("Banners", 3 banner images)

### Project 4: Kellogg's Muesli
- **Company**: Dy works
- **Client**: Kellogg's
- **Categories**: Packaging Design
- **Concept**: "Farm-to-table breakfast concept with fresh ingredients"
- **Content Blocks**: textBlock(concept board details) → galleryBlock(pack elements) → beforeAfterBlock("Previous FOP" / "Current FOP") → beforeAfterBlock("Previous BOP" / "Current BOP") → galleryBlock(final packs) → galleryBlock("Banner Design")

### Project 5: Nippo
- **Company**: Dy works
- **Client**: Nippo
- **Categories**: Brand Identity
- **Rich structure**: Logo → Colours → Visual Language → Iconography → Applications (brochures, website, packaging)
- **Content Blocks**: textBlock("Logo") → textBlock("Colours") → textBlock("Circle of Joy: Visual Language") → textBlock("Iconography") → galleryBlock("Applications") → galleryBlock("Website") → galleryBlock("Packaging & Collateral")

### Project 6: Sugar Free D'lite
- **Company**: Dy works
- **Client**: Sugar Free
- **Categories**: Packaging Design
- **Content Blocks**: textBlock(concept) → galleryBlock("Concept Board") → textBlock("Architecture Unit") → textBlock("System Design") → galleryBlock("Full Range") → galleryBlock("Category - Granola") → galleryBlock("Category - Chocolate") → galleryBlock("Category - Beverage Premixes") → galleryBlock("Final Photography")

### Project 7: Vizylac
- **Company**: Dy works
- **Client**: Vizylac
- **Categories**: Packaging Design
- **Content Blocks**: galleryBlock("Option 1", many images) → galleryBlock("Option 2", many images)

### Projects 8–13: Shorter projects
- Follow simpler patterns: brief/minimal text + gallery of final designs

---

## Notes

- The old `content` (richText) and `gallery` (flat array) fields should be kept for backward compatibility but marked as deprecated — new projects should use `contentBlocks`
- The `summary` field remains for card descriptions and SEO
- The `company` field captures the agency context, while `client` captures the brand — both are shown in the metadata bar
- The block-based system gives the admin (your wife) full flexibility to add/remove/reorder content sections per project, matching the narrative flow of her portfolio naturally
