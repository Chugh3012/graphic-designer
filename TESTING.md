# Testing Guide

This document covers how to verify changes to the Graphic Designer Portfolio, both locally and through CI.

---

## Test Plan Overview

The project uses a layered testing strategy:

| Layer | Tool | What It Validates |
|---|---|---|
| **Linting** | ESLint (`npm run lint`) | Code style, Next.js best practices |
| **Type Checking** | TypeScript (`npx tsc --noEmit`) | Type safety across the codebase |
| **E2E Tests** | Playwright (`npm run test:e2e`) | User-facing functionality in a real browser |
| **CI Pipeline** | GitHub Actions (`.github/workflows/ci.yml`) | All of the above on every pull request |

### E2E Test Coverage

| Test File | What It Tests |
|---|---|
| `tests/e2e/homepage.spec.ts` | Page load, featured work section, navigation links |
| `tests/e2e/projects.spec.ts` | Project listing, project cards, detail pages, category filtering |
| `tests/e2e/contact-form.spec.ts` | Form fields, validation errors, email validation, submission handling |

---

## Running Tests Locally

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- A `.env` file (copy from `.env.example`)

### Quick Start

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy environment file (first time only)
cp .env.example .env

# 4. Run all E2E tests (starts dev server automatically)
npm run test:e2e
```

### Test Commands

```bash
npm run test:e2e              # Run all E2E tests headless
npm run test:e2e:ui           # Interactive Playwright UI with time-travel debugging
npm run test:e2e:headed       # Run tests in a visible browser window
npm run test:e2e:debug        # Step through tests with Playwright Inspector

# Run a single test file
npx playwright test tests/e2e/contact-form.spec.ts

# Run a single test by name
npx playwright test -g "should display contact form"

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

---

## CI Pipeline (Automated on PRs)

The CI workflow (`.github/workflows/ci.yml`) runs automatically on every pull request to `main`. It executes three parallel jobs:

1. **Lint** — ESLint validation
2. **Type Check** — TypeScript compilation check
3. **E2E Tests** — Full Playwright test suite with a PostgreSQL service container

### CI Features

- PostgreSQL 16 spun up as a GitHub Actions service container
- Playwright browser (Chromium) installed with system dependencies
- Test results uploaded as artifacts (viewable for 14 days)
- 2 retries on CI for flaky test resilience
- Sequential test execution on CI to avoid resource contention

### Viewing CI Results

After a PR is opened or updated:
1. Go to the **Checks** tab on the pull request
2. Click on **E2E Tests** to see individual test results
3. Download **playwright-report** artifact for detailed HTML report

---

## Live Testing with GitHub Codespaces

For live testing directly in the browser without any local setup:

### Getting Started

1. Go to the repository on GitHub
2. Click **Code** → **Codespaces** → **Create codespace on main** (or on your branch)
3. Wait for the devcontainer to build (first time takes ~3-5 minutes)
4. The environment will automatically:
   - Install Node.js 20 and project dependencies
   - Start PostgreSQL on port 5433
   - Install Playwright browsers
   - Copy `.env.example` to `.env`
5. Run the dev server:
   ```bash
   npm run dev
   ```
6. Codespaces will auto-forward port 3000 and open the site in your browser

### What You Can Do in Codespaces

- **Browse the live site** — Navigate all pages, test responsive design
- **Access the admin panel** — Go to `/admin` to create content, test CMS workflows
- **Run E2E tests** — `npm run test:e2e` to validate everything works
- **Make and preview changes** — Edit code and see live updates via Next.js hot reload
- **Test the contact form** — Submit the form (email won't send without `RESEND_API_KEY`, but you can verify the form validation and error handling)

### Adding Real Data for Testing

Once the dev server is running in Codespaces:
1. Navigate to `http://localhost:3000/admin`
2. Create a first admin user (PayloadCMS `registerFirstUser` flow)
3. Add project categories (Branding, Packaging, Print, Identity)
4. Create sample projects with images
5. Configure the HomePage global to feature specific projects
6. Visit the public site to verify everything displays correctly

---

## Testing with Docker (Full Stack)

To test the production Docker build locally:

```bash
# Build the production image
docker build -t graphic-designer .

# Run with the database
docker compose up -d  # Start PostgreSQL
docker run --rm \
  --network host \
  -e DATABASE_URI=postgresql://payload:payload_dev@localhost:5433/graphic_designer \
  -e PAYLOAD_SECRET=$(openssl rand -hex 32) \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  graphic-designer
```

---

## Actions Required from Repository Owner

To enable all testing capabilities, the following one-time setup is needed:

### 1. Enable GitHub Codespaces (Required for Live Testing)

- Go to **Settings** → **Codespaces** in the repository
- Enable Codespaces for the repository (available on GitHub Pro, Team, or Enterprise)
- The `.devcontainer/` configuration is already set up and ready to use

### 2. CI Pipeline (Already Configured)

The CI workflow (`.github/workflows/ci.yml`) will run automatically when:
- A pull request is opened or updated against `main`
- No additional secrets or setup needed — the CI uses its own PostgreSQL service container

### 3. Optional: Add Secrets for Full Integration Testing

For testing email functionality in CI:
- Add `RESEND_API_KEY` as a repository secret (**Settings** → **Secrets and variables** → **Actions**)
- Add `CONTACT_EMAIL_TO` as a repository secret

### 4. Optional: Branch Protection Rules

For enforcing quality on every change:
1. Go to **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Enable:
   - ☑ Require a pull request before merging
   - ☑ Require status checks to pass before merging
   - Select required checks: `Lint`, `Type Check`, `E2E Tests`
   - ☑ Require branches to be up to date before merging

---

## Verification Checklist

When verifying a change, use this checklist:

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run test:e2e` passes
- [ ] Pages render correctly at `/`, `/work`, `/about`, `/contact`
- [ ] Admin panel accessible at `/admin`
- [ ] Navigation links work on all pages
- [ ] Contact form validation works (required fields, email format)
- [ ] Responsive layout works at mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Images load correctly (or show placeholders when no Azure config)
