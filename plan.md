# Tech Stack & Implementation Plan: Graphic Designer Portfolio Website

## Overview

A portfolio and freelance services website for a branding & packaging graphic designer. Starts simple (portfolio + contact), architected to grow (blog, booking, testimonials, e-commerce). Uses Azure ($150/month budget) for hosting.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) | SSR/ISR for SEO, React ecosystem, user's choice |
| **CMS** | PayloadCMS 3.x | Next.js-native (single deploy), built-in admin panel at `/admin`, open-source, config-as-code (great for backend engineers), first-class image handling, Azure Blob adapter built-in |
| **Database** | PostgreSQL 16 | Payload's recommended DB, relational + JSON support |
| **Styling** | Tailwind CSS v4 | Rapid iteration, small production bundles, design token system |
| **Animations** | Framer Motion 11 | Page transitions, scroll animations, portfolio filter animations, lightbox |
| **Email** | Resend (free tier: 3K emails/month) | Dead-simple API, React Email templates, free for portfolio contact form volume |
| **Forms** | React Hook Form + Zod | Client validation + server action validation |
| **Runtime** | Node.js 20 LTS | Long-term support, required by Next.js/Payload |
| **Container** | Docker (multi-stage alpine) | Reproducible builds, clean deploys to Azure |

### Why PayloadCMS over Sanity/Strapi

- **vs Sanity:** Self-hosted (no vendor lock-in, no usage-based pricing surprises at scale). Sanity free tier is generous but Pro is $99/month if exceeded.
- **vs Strapi:** Single deployment (Payload lives inside Next.js). Strapi requires a separate server = double Azure cost + CORS + two CI/CD pipelines.
- **Admin panel:** Clean, React-based UI. Your wife can add/edit projects, upload images, manage categories, and preview content without touching code.

---

## Azure Architecture

```
GitHub Actions CI/CD
        |
        v
Azure Container Registry (Basic ~$5/mo)
        |
        v
Azure App Service B2 Linux (~$26/mo)
  |- Next.js 15 + PayloadCMS 3.x
  |- Admin panel at /admin
  |- Server-side rendering
        |
        +---> Azure PostgreSQL Flexible Server B1ms (~$15/mo)
        +---> Azure Blob Storage Hot/LRS (~$2-5/mo)
        +---> Azure CDN Standard (~$5-10/mo)

Estimated total: ~$53-61/month (well within $150 budget)
```

### Azure Services Detail

| Service | SKU | Cost/mo | Purpose |
|---|---|---|---|
| App Service Plan | B2 Linux (2 cores, 3.5GB) | ~$26 | Hosts the app (always-on, no cold starts) |
| PostgreSQL Flexible | Burstable B1ms (1 vCore, 2GB, 32GB storage) | ~$15 | CMS database |
| Blob Storage | Hot tier, LRS | ~$2-5 | Portfolio images and media |
| CDN | Standard Microsoft | ~$5-10 | Fast image/asset delivery globally |
| Container Registry | Basic | ~$5 | Docker image storage for CI/CD |
| Managed SSL | Free with App Service | $0 | HTTPS |

---

## Pages to Build

1. **Home** (`/`) — Hero with name/tagline, featured work grid (3-4 projects from CMS), about preview, services overview (branding/packaging/print), CTA section
2. **Portfolio** (`/work`) — Filterable grid by category (Branding, Packaging, Print, Identity), project cards with hover effects, "load more" pagination
3. **Project Detail** (`/work/[slug]`) — Hero image, client/year/services metadata, rich text narrative, image gallery with lightbox, next/previous navigation
4. **About** (`/about`) — Photo, bio (CMS-driven), design process section, tools/skills
5. **Contact** (`/contact`) — Form (name, email, project type, budget range, message), honeypot spam prevention, email notification via Resend
6. **Admin** (`/admin`) — PayloadCMS auto-generated admin panel (no development needed)

---

## CMS Content Model (PayloadCMS Collections)

### Collections
- **Projects** — title, slug, heroImage, categories (relationship), client, year, services[], summary, richText content, gallery[] (image + caption), featured flag, sortOrder, status (draft/published), SEO group (metaTitle, metaDescription, ogImage)
- **ProjectCategories** — name, slug
- **Media** — upload collection with auto-generated sizes: thumbnail (400px), card (768px), hero (1920px). Azure Blob adapter. Required `alt` text field.
- **Users** — admin authentication (built-in)

### Globals (site-wide editable settings)
- **SiteSettings** — site title, tagline, social links (Instagram, Behance, LinkedIn, Dribbble), default SEO
- **Navigation** — nav menu items
- **Footer** — footer content, copyright
- **HomePage** — hero heading/subheading, featured project selections, CTA text

---

## Project Structure

```
src/
  app/
    (frontend)/          # Public pages (route group, no URL impact)
      layout.tsx         # Nav + footer wrapper
      page.tsx           # Home
      work/
        page.tsx         # Portfolio grid
        [slug]/page.tsx  # Project detail
      about/page.tsx
      contact/page.tsx
    (payload)/           # CMS routes
      admin/[[...segments]]/page.tsx
      api/[...slug]/route.ts
    layout.tsx           # Root layout (fonts, metadata)
    globals.css
    sitemap.ts
    robots.ts
  collections/           # Payload collection configs
    Projects.ts
    ProjectCategories.ts
    Media.ts
    Users.ts
  globals/               # Payload global configs
    SiteSettings.ts
    Navigation.ts
    Footer.ts
    HomePage.ts
  components/
    layout/              # Header, Footer, Navigation, MobileMenu
    portfolio/           # ProjectGrid, ProjectCard, ProjectGallery, CategoryFilter, Lightbox
    home/                # Hero, FeaturedWork, AboutPreview, CTASection
    contact/             # ContactForm, ContactInfo
    ui/                  # Button, Container, Typography, Card
    shared/              # ImageWithBlur, AnimatedSection, PageTransition
  lib/
    payload.ts           # Payload client helpers
    queries.ts           # Data fetching (Payload Local API)
    utils.ts
    validations.ts       # Zod schemas for forms
  styles/
    fonts.ts             # next/font config
    tokens.ts            # Design tokens
  payload.config.ts      # Main Payload config
```

---

## Design Approach

- **Typography:** Display serif for headings (e.g., Instrument Serif or designer's choice via `next/font/local`), Inter for body text
- **Color palette:** Neutral base (cream background, charcoal text, stone secondary), one warm accent color — content should be the star on a designer's site
- **Responsive:** Mobile-first, Tailwind breakpoints. Portfolio grid: 1 col mobile, 2 col tablet, 3 col desktop
- **Animations:** Scroll-triggered entrance animations, portfolio filter layout animations, smooth lightbox transitions, page transitions. All respect `prefers-reduced-motion`.

---

## Image Strategy (Critical for Portfolio)

1. **Upload:** Designer uploads via Payload admin → Payload auto-generates 3 sizes (thumbnail 400px, card 768px, hero 1920px) → `@payloadcms/storage-azure` sends all variants to Blob Storage
2. **Delivery:** Azure CDN serves images → Next.js `<Image>` handles responsive `srcset`, lazy loading, AVIF/WebP format negotiation, blur placeholders
3. **Lightbox:** Custom Framer Motion lightbox or `yet-another-react-lightbox` — click-to-fullscreen, swipe navigation, keyboard support, adjacent image preloading

---

## SEO Strategy

- `generateMetadata` on every page with title, description, Open Graph, Twitter cards
- JSON-LD structured data: `LocalBusiness`, `CreativeWork` (per project), `WebSite`
- Dynamic `sitemap.ts` pulling published projects from CMS
- `robots.ts` allowing crawlers, disallowing `/admin`
- Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1

---

## Contact Form

- **Fields:** name, email, project type (dropdown), budget range (dropdown), message
- **Spam prevention:** Honeypot field (hidden input bots fill) + rate limiting (3/hour/IP)
- **Server action:** Validate with Zod → send notification email to designer via Resend → send confirmation to submitter → optionally store in Payload "Submissions" collection

---

## Implementation Phases

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript, Tailwind, ESLint
2. Install PayloadCMS 3.x with PostgreSQL adapter
3. Set up `docker-compose.yml` for local PostgreSQL
4. Configure Azure Blob Storage + `@payloadcms/storage-azure`
5. Set up design tokens, fonts, base layout components

### Phase 2: Content Model
6. Create all Payload collections (Projects, Categories, Media, Users)
7. Create all Payload globals (SiteSettings, Navigation, Footer, HomePage)
8. Seed 3-5 sample projects with real portfolio images

### Phase 3: Frontend Pages
9. Build header/footer/navigation (responsive, mobile menu)
10. Build home page (hero, featured work, about preview, CTA)
11. Build portfolio page (filterable grid, category filter with URL params)
12. Build project detail page (gallery, lightbox, rich content, next/prev)
13. Build about page
14. Build contact page (form + Resend integration)

### Phase 4: Polish & SEO
15. Implement `generateMetadata` + JSON-LD on all pages
16. Create dynamic sitemap and robots.txt
17. Add Framer Motion animations (scroll, page transitions, hover effects)
18. Performance audit with Lighthouse (target 90+)
19. Responsive testing across devices
20. Set up ISR + on-demand revalidation via Payload `afterChange` hooks

### Phase 5: Deployment
21. Create multi-stage Dockerfile (alpine, standalone output)
22. Provision Azure resources (PostgreSQL, Blob Storage, ACR, App Service, CDN) via Azure CLI
23. Create GitHub Actions CI/CD workflow (lint → type-check → Docker build → push to ACR → deploy to App Service)
24. Configure environment variables in App Service
25. Verify production deployment, test admin panel, test contact form

### Phase 6: Future (Post-Launch)
- Blog (add `BlogPosts` collection + pages)
- Testimonials section
- Booking/consultation (Calendly embed or custom)
- Pricing packages page
- Analytics (Plausible or Azure Application Insights)
- E-commerce for selling design templates (Stripe integration)
- Custom domain + DNS configuration

---

## Key Files to Create/Modify

| File | Purpose |
|---|---|
| `src/payload.config.ts` | Central CMS config: DB adapter, storage, collections, globals |
| `src/collections/Projects.ts` | Core portfolio content model |
| `src/collections/Media.ts` | Image upload config with Azure Blob + auto-sizes |
| `src/app/(frontend)/layout.tsx` | Public layout (nav + footer + fonts) |
| `src/app/(frontend)/work/page.tsx` | Portfolio grid page |
| `src/app/(frontend)/work/[slug]/page.tsx` | Project detail page |
| `src/app/(frontend)/contact/page.tsx` | Contact form page |
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Local dev (PostgreSQL) |
| `.github/workflows/deploy-production.yml` | CI/CD pipeline |
| `tailwind.config.ts` | Design tokens |
| `.env.example` | Environment variable template |

---

## Environment Variables

```
DATABASE_URI=postgresql://...
PAYLOAD_SECRET=<openssl rand -hex 32>
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=portfolio-media
AZURE_CDN_HOSTNAME=cdn-endpoint.azureedge.net
RESEND_API_KEY=re_...
CONTACT_EMAIL_TO=designer@example.com
NEXT_PUBLIC_SITE_URL=https://app-name.azurewebsites.net
```

---

## Verification Plan

1. **Local dev:** `docker compose up` (PostgreSQL) → `npm run dev` → verify homepage renders, admin panel at `/admin` works, can create a project with images
2. **CMS test:** Create a project in admin → verify it appears on `/work` and `/work/[slug]` → verify images load from Azure Blob → verify category filtering works
3. **Contact test:** Submit contact form → verify email received via Resend → verify honeypot blocks bot submissions
4. **SEO test:** Check page source for meta tags, Open Graph, JSON-LD → validate with Google Rich Results Test → verify sitemap at `/sitemap.xml`
5. **Performance:** Run Lighthouse audit → verify scores 90+ on Performance, Accessibility, SEO, Best Practices
6. **Deployment:** Push to main → verify GitHub Actions pipeline succeeds → verify production site loads → verify admin panel works in production → verify image uploads go to Azure Blob → verify CDN serves images
7. **Responsive:** Test on mobile (375px), tablet (768px), desktop (1280px+) using browser dev tools
