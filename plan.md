# Graphic Designer Portfolio — Project Plan (canonical)

> North-star document. Re-read when drifting. Update in place as decisions evolve.

A portfolio + freelance-services site for a branding & packaging designer. Starts
simple (portfolio + contact), architected to grow (blog, testimonials, booking).

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, TS) | SSR/ISR for SEO |
| CMS | PayloadCMS 3 | Lives inside Next — single deploy; admin at `/admin` |
| DB | PostgreSQL 16 | Schema changes via committed migrations (not auto-push) |
| Styling | Tailwind CSS 4 | |
| Animation | Framer Motion 12 | |
| Email | Azure Communication Email | Contact form (server action) |
| Forms | React Hook Form + Zod 4 | Client + server validation |
| Media | Azure Blob Storage (public media container) | Served directly from Blob |
| Hosting | Azure Container Apps | Scale 1→3, passwordless via managed identity |
| Secrets | Azure Key Vault | Pulled by the app's managed identity |
| CI/CD | GitHub Actions (OIDC) | No stored SP secret, no ACR password |
| Telemetry | Application Insights (OpenTelemetry) | Enabled in production only |

## Architecture

```
GitHub Actions (OIDC, no secrets)
  ├─ infra.yml (manual)      → Bicep → all Azure resources
  └─ deploy-production.yml   → az acr build → migrate → containerapp update → /healthz
                                   │
Azure Container Apps  ◀── image pull (managed identity, AcrPull) ── ACR (admin disabled)
  │  env secrets ◀── Key Vault (managed identity, Secrets User)
  ├─ PostgreSQL Flexible (B1ms)
  └─ Blob Storage (portfolio-media, public read) — media URLs
```

Single source of truth for infra: [infra/main.bicep](infra/main.bicep). Deploy via
[.github/workflows/infra.yml](.github/workflows/infra.yml).

## Content model (Payload)

- **Projects** — title, slug (auto), heroImage, categories, company, client, year,
  services[], summary, brief, keyConsiderations[], concept, `contentBlocks` (Text /
  Image / Gallery / BeforeAfter), featured, sortOrder, status (draft/published), SEO.
- **ProjectCategories**, **Media**, **Users**.
- Globals: SiteSettings, Navigation, Footer, HomePage.

Frontend queries live in [src/lib/queries.ts](src/lib/queries.ts) (typed via
generated `payload-types`). Always filter `status: 'published'`.

## Security posture

- Passwordless: managed identity for ACR pull + Key Vault; GitHub OIDC for deploy.
- No secrets in repo or pipeline; the only secrets live in Key Vault.
- DB schema changes are gated through committed migrations (`push: false` in prod).
- Contact form: Zod validation + honeypot + per-IP rate limiting.
- Dependencies kept patched (`npm audit --audit-level=high` is a CI gate).

## Known ceilings / future work (ponytail notes)

- **Postgres auth**: password (in Key Vault) + public-network firewall. Upgrade:
  VNet + private endpoints and a Microsoft Entra token password provider.
- **Rate limiter**: in-memory, per-instance. Upgrade: shared store (Redis) for a
  strict global limit.
- **Payload admin email**: no email adapter wired yet → admin password-reset mail
  goes to the container logs. Add a Payload email adapter (Azure Communication
  Email) before relying on self-service password reset.
- **Media CDN**: served directly from Blob. Add Azure Front Door if global edge
  caching is needed.

## Branch protection (required, set in GitHub UI)

`master` should require the CI workflow (lint, type-check, unit-tests, e2e, docker
build + scan) to pass via PR. Direct pushes to `master` trigger deploy without CI.
