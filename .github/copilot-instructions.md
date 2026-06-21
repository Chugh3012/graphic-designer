# Copilot Instructions for Graphic Designer Portfolio

## Project Overview

A portfolio website for a graphic designer built with Next.js 15 and PayloadCMS 3. The site allows the designer to independently manage projects, categories, and media through the CMS admin panel.

**Tech Stack:** Next.js 15 (App Router), PayloadCMS 3, PostgreSQL, TypeScript, Tailwind CSS 4, Azure Blob Storage + CDN, Resend (email), React Hook Form + Zod

## Commands

```bash
# Development
npm run dev                  # Start Next.js dev server (http://localhost:3000)
docker-compose up -d         # Start PostgreSQL database (port 5433)

# Build & Deploy
npm run build                # Production build (generates standalone output)
npm start                    # Run production server
docker build -t graphic-designer .  # Build Docker image

# Code Quality
npm run lint                 # Run ESLint with Next.js TypeScript config

# Testing
npm run test:e2e             # Run Playwright E2E tests in headless mode
npm run test:e2e:ui          # Run tests with Playwright UI (interactive)
npm run test:e2e:headed      # Run tests in headed browser (visible)
npm run test:e2e:debug       # Run tests in debug mode with Playwright Inspector

# PayloadCMS
npm run generate:types       # Generate TypeScript types from Payload config → src/payload-types.ts
npm run generate:importmap   # Generate import map for Payload admin UI
```

**Running single tests:** 
- ESLint: `npx eslint <file-path>`
- Single test file: `npx playwright test tests/e2e/contact-form.spec.ts`
- Single test: `npx playwright test -g "should display contact form"`

## Architecture

### Route Structure (Next.js 15 App Router)

- **`src/app/(frontend)/`** - Public-facing portfolio site
  - Routes: `/` (home), `/work` (projects), `/work/[slug]` (project detail), `/about`, `/contact`
- **`src/app/(payload)/`** - PayloadCMS admin panel
  - Accessible at `/admin` after running migrations and creating a user

### PayloadCMS Collections & Globals

**Collections** (multiple entries):
- `projects` - Portfolio projects with title, slug, hero image, categories, gallery, client, year, services, rich text content, featured flag, status (draft/published), sortOrder
- `project-categories` - Category taxonomy for organizing projects
- `media` - Image uploads with automatic sizing (thumbnail: 400px, card: 768px, hero: 1920px). Stored in Azure Blob Storage when configured, otherwise local `media/` directory
- `users` - Admin users for CMS access

**Globals** (site-wide singletons):
- `site-settings` - Site metadata, SEO defaults
- `navigation` - Main site navigation structure
- `footer` - Footer content and links
- `home-page` - Home page hero content and featured work configuration

### Data Fetching Pattern

- **Server-side queries:** Use `src/lib/queries.ts` functions (e.g., `getPublishedProjects()`, `getProjectBySlug()`)
- **Get Payload client:** Import `getPayloadClient()` from `src/lib/payload.ts`
- All queries use `await getPayloadClient()` then `payload.find()` or `payload.findGlobal()`
- Example: Projects are sorted by `sortOrder` (asc) then `createdAt` (desc)

### Server Actions

- **Contact form:** `src/lib/actions.ts` contains `submitContactForm()` which validates with Zod, checks honeypot field (`website`), and sends email via Resend
- All server actions marked with `'use server'` directive

## Key Conventions

### Slug Generation
Projects use auto-generated slugs from titles via `beforeValidate` hook:
- Lowercase, trim whitespace, replace spaces with hyphens, remove special characters
- Can be manually overridden in admin panel (sidebar field)

### Media & Images
- Always set `alt` text (required field in Media collection)
- Use relationship fields (`type: 'upload', relationTo: 'media'`) for all image references
- Azure CDN hostname configured via `AZURE_CDN_HOSTNAME` environment variable
- Media URLs automatically resolved to CDN when Azure Storage is configured

### Form Validation
- All forms use React Hook Form + `@hookform/resolvers` with Zod schemas
- Schemas defined in `src/lib/validations.ts`
- Contact form includes honeypot field (`website`) - must remain empty (max length 0)

### Status & Publishing
- Projects have `status` field: `'draft'` or `'published'`
- Always filter by `status: 'published'` in frontend queries
- Use `featured` checkbox flag to highlight selected projects on homepage

### Styling
- Tailwind CSS 4 utility classes throughout
- Helper function: `cn()` in `src/lib/utils.ts` for conditional class merging
- No custom CSS files except `src/app/globals.css` for base styles

### Type Generation
After modifying PayloadCMS collections/globals, run `npm run generate:types` to update `src/payload-types.ts`. This ensures type safety across the application.

## Environment Variables

Required in `.env` (see `.env.example`):
```
DATABASE_URI                      # PostgreSQL connection string (dev: port 5433)
PAYLOAD_SECRET                    # JWT secret (generate with: openssl rand -hex 32)
AZURE_STORAGE_CONNECTION_STRING   # Optional: Azure Blob Storage
AZURE_STORAGE_CONTAINER_NAME      # Optional: Container name (default: portfolio-media)
AZURE_CDN_HOSTNAME                # Optional: CDN hostname for media URLs
RESEND_API_KEY                    # For contact form emails
CONTACT_EMAIL_TO                  # Email recipient for contact form submissions
NEXT_PUBLIC_SITE_URL              # Base site URL (dev: http://localhost:3000)
```

## Docker

Multi-stage Dockerfile optimized for Next.js standalone output:
1. **deps stage:** Install dependencies with `npm ci`
2. **builder stage:** Build Next.js application
3. **runner stage:** Production image (Node 20 Alpine, runs as non-root user `nextjs`)

Exposes port 3000, runs `node server.js` from `.next/standalone/`

## Common Tasks

**Adding a new collection:**
1. Create `src/collections/YourCollection.ts` with `CollectionConfig`
2. Import and add to `collections` array in `src/payload.config.ts`
3. Run `npm run generate:types` to update TypeScript types
4. Restart dev server to apply changes

**Querying PayloadCMS from frontend:**
1. Add query function in `src/lib/queries.ts`
2. Use `await getPayloadClient()` then `payload.find()` or `payload.findGlobal()`
3. Call from Server Components (Next.js App Router default)
4. Type queries with generated types from `src/payload-types.ts`

**Adding a new page:**
1. Create folder in `src/app/(frontend)/your-page/`
2. Add `page.tsx` (Server Component by default)
3. Import layout components from `src/components/layout/`
4. Update Navigation global in PayloadCMS admin if adding to menu

## Testing

### E2E Tests with Playwright

Tests are located in `tests/e2e/` directory. Key test files:
- `homepage.spec.ts` - Homepage navigation and featured work display
- `contact-form.spec.ts` - Contact form validation and submission
- `projects.spec.ts` - Project listing, filtering, and detail pages

**Writing new tests:**
- Use `page.getByRole()`, `page.getByLabel()`, and `page.getByText()` for accessibility-first selectors
- Add `data-testid` attributes to components only when semantic selectors aren't sufficient
- Tests automatically start dev server on port 3000 before running
- All tests use Chromium browser by default (configured in `playwright.config.ts`)

**Debugging tests:**
- Use `npm run test:e2e:ui` for interactive mode with time-travel debugging
- Use `npm run test:e2e:debug` to step through tests with Playwright Inspector
- Add `await page.pause()` in test code to stop at specific points

# Ponytail, lazy senior dev mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does the standard library already do this? Use it.
3. Does a native platform feature cover it? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can this be one line? Make it one line.
6. Only then: write the minimum code that works.

Rules:

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.
- Mark intentional simplifications with a `ponytail:` comment. If the shortcut has a known ceiling (global lock, O(n²) scan, naive heuristic), the comment names the ceiling and the upgrade path.

Not lazy about: input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested. Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.