# Graphic Designer Portfolio — Project Plan (canonical)

> North-star document. Re-read when drifting. Update in place as decisions evolve.

A portfolio + freelance-services site for a branding & packaging designer. Starts
simple (portfolio + contact), architected to grow.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, TS) | SSR/ISR for SEO |
| CMS | PayloadCMS 3 | Lives inside Next — single deploy; admin at `/admin` |
| Database | **SQLite** (`@payloadcms/db-sqlite`, libSQL) | A file — no DB server. Schema auto-synced on boot. |
| Styling | Tailwind CSS 4 | |
| Animation | Framer Motion 12 | |
| Email | Azure Communication Email | Contact form (server action) |
| Forms | React Hook Form + Zod 4 | Client + server validation |
| Media | Local filesystem (`MEDIA_DIR`) | On the mounted volume in production |
| Hosting | Azure Container Apps | Scale-to-zero, **max 1 replica**, free monthly grant |
| Persistence | Azure Files share | Holds the SQLite DB **and** media uploads |
| Registry | GitHub Container Registry (ghcr.io) | Free |
| Secrets | Azure Key Vault (free tier) | `PAYLOAD_SECRET` + email string, read via managed identity |
| CI/CD | GitHub Actions (OIDC) | No stored SP secret |
| Telemetry | Application Insights (free tier) | Production only |

**Target cost: ~$0/month.** No managed database, no container registry fees, no
Blob; Container Apps stays within the free grant when scaled to zero.

## Architecture

```
GitHub Actions
  ├─ infra.yml (manual)      → Bicep → Azure resources
  └─ deploy-production.yml   → ghcr.io build/push → containerapp update → /healthz
                                   │
Azure Container Apps (scale 0→1, single replica)
  ├─ image ← ghcr.io (public)
  ├─ secrets ← Key Vault (managed identity)
  └─ volume  ← Azure Files share  →  /app/.data/portfolio.db (SQLite)
                                     /app/.data/media         (uploads)
```

Single source of truth for infra: [infra/main.bicep](infra/main.bicep).

## Content model (Payload)

- **Projects** — title, slug (auto), heroImage, categories, company, client, year,
  services[], summary, brief, keyConsiderations[], concept, `contentBlocks` (Text /
  Image / Gallery / BeforeAfter), featured, sortOrder, status (draft/published), SEO.
- **ProjectCategories**, **Media**, **Users**. Globals: SiteSettings, Navigation,
  Footer, HomePage.

Frontend queries live in [src/lib/queries.ts](src/lib/queries.ts) (typed via
generated `payload-types`). Always filter `status: 'published'`.

## Security posture

- Passwordless pipeline: **GitHub OIDC** to Azure; `GITHUB_TOKEN` to ghcr.io.
- App secrets (`PAYLOAD_SECRET`, email string) live in **Key Vault**, read by the
  app's **managed identity** — none in the repo or pipeline.
- SQLite has no network credential; the only key is the storage-account key used by
  the Container Apps Azure Files mount (in the managed-environment config, not the repo).
- Contact form: Zod validation + honeypot + per-IP rate limiting.
- Dependencies kept patched (`npm audit --audit-level=high` is a CI gate).

## Known ceilings / future work (ponytail notes)

- **SQLite on SMB (Azure Files)** → single writer, so the app runs at **max 1
  replica**. Fine for a read-heavy portfolio. Upgrade path: Turso (libSQL, free)
  or a managed Postgres if write concurrency is ever needed.
- **Schema push on boot** can drop columns on a destructive change. For a risky
  change, run `payload migrate` against the volume instead (migrations committed).
- **Media served via the Node app** (no CDN). Add Azure Front Door / a CDN if
  global edge caching is needed.
- **Payload admin email**: no adapter wired → admin password-reset mail goes to
  logs. Add an email adapter before relying on self-service reset.

## Branch protection (required, set in GitHub UI)

`master` should require the CI workflow (lint, type-check, unit tests, e2e, docker
build + scan) to pass via PR. Direct pushes to `master` trigger deploy.
