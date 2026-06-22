# Graphic Designer Portfolio — Project Plan (canonical)

> North-star document. Re-read when drifting. Update in place as decisions evolve.

A portfolio + freelance-services site for a branding & packaging designer. Starts
simple (portfolio + contact), architected to grow — with the **simplest correct
tooling**: a static site backed by a git-based CMS, hosted free.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, TS) | Static pages + a tiny managed backend |
| CMS | **Keystatic** (git-based) | Content = files in this repo. No DB, no server. Admin at `/keystatic`. |
| Content format | JSON + Markdoc under `content/` | Read at build time via Keystatic's `createReader` |
| Images | Files under `public/images/` | Served directly; `images.unoptimized` (no sharp at runtime) |
| Styling | Tailwind CSS 4 | |
| Animation | Framer Motion 12 | |
| Email | Azure Communication Email | Contact form (server action), optional |
| Forms | React Hook Form + Zod 4 | Client + server validation, honeypot, rate-limit |
| Hosting | **Azure Static Web Apps (Free)** | Static pages + managed backend for SSR routes |
| CI/CD | GitHub Actions | `ci.yml` (PR gate) + `deploy.yml` (SWA token) |

**Target cost: ~$0/month.** No database, storage account, Key Vault, container
registry, or Container App — content lives in git, hosting is the SWA Free tier.

## Architecture

```
GitHub (content + code in one repo)
  └─ push master ─► deploy.yml ─► Azure/static-web-apps-deploy (token)
                                     │ Oryx: npm install + npm run build
                                     ▼
Azure Static Web Apps (Free)
  ├─ static pages      ← Keystatic reader renders content/ at build time
  ├─ managed backend   ← contact server action + /api/keystatic admin API
  └─ /keystatic admin  ← GitHub storage mode (commits to repo) once App is set
```

Single source of truth for infra: [infra/main.bicep](infra/main.bicep).
Deploy runbook + app settings: [infra/README.md](infra/README.md).

## Content model (Keystatic — `keystatic.config.ts`)

- **projects** (`content/projects/*.json`) — title (slug), status, featured,
  sortOrder, heroImage, categories[], company, client, year, services[], summary,
  brief, concept, keyConsiderations[], gallery[{image, caption}], seo.
- **categories** (`content/categories/*.json`).
- Singletons: **siteSettings**, **homePage**, **about** (`content/settings/*`).

Frontend queries live in [src/lib/queries.ts](src/lib/queries.ts) — they wrap
`createReader` and return normalized, mutable shapes (`ProjectSummary` /
`ProjectFull`) so components never touch the CMS schema directly.

## Editing content

- **Local**: `npm run dev`, edit at `/keystatic` (local storage mode), commit.
- **Hosted**: once the GitHub App env vars are set on the SWA (see infra/README),
  the live `/keystatic` admin commits straight to the repo, which re-triggers a
  deploy. Storage mode is gated on `KEYSTATIC_GITHUB_CLIENT_ID` being present.

## Security posture

- No app secrets in the repo. Deploy uses a scoped SWA **deployment token** (repo
  secret), not cloud credentials.
- Contact form: Zod validation + honeypot + per-IP rate limiting. Email is disabled
  until `AZURE_COMMUNICATION_CONNECTION_STRING` + sender are set in SWA app settings.
- Security headers (CSP, HSTS, X-Frame-Options, …) set in `next.config.ts`.
- Dependencies kept patched (`npm audit --audit-level=high` is a CI gate).

## Known ceilings / future work (ponytail notes)

- **SWA hybrid Next.js is in preview** (250 MB app cap). Fine for this site.
  If it regresses, fall back to a static export (drop the server routes) or move
  the SSR bits to a small Function App.
- **Free tier = no managed identity**, so the ACS email connection string is a
  stored app setting. Upgrade path for passwordless: SWA Standard + user-assigned
  identity, or send mail from a Function App with MI.
- **No custom domain yet** — add one on the SWA (free managed cert) when ready.

## Branch protection (set in GitHub UI)

`master` should require `ci.yml` (lint, type-check, unit tests, audit) on PRs.
Pushes to `master` trigger the SWA deploy.
