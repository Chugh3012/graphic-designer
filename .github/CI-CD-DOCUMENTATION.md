# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline for the Graphic Designer Portfolio website.

## Overview

The project implements a multi-layered CI/CD pipeline with security, quality, and performance checks to ensure production-readiness.

## CI Workflows

### 1. Main CI Pipeline (`.github/workflows/ci.yml`)

Runs on every pull request to `master` branch.

#### Jobs

**Security Audit** 🔒
- Runs `npm audit --audit-level=high`
- Blocks PRs with high/critical severity vulnerabilities
- Fast execution (~10 seconds)

**Lint** 📝
- ESLint validation with Next.js rules
- React hooks validation
- Code style enforcement

**Type Check** 🔍
- TypeScript compilation check
- Ensures type safety across codebase
- Catches type errors before runtime

**Docker Build** 🐳
- Validates Docker image builds successfully
- Uses buildx with caching for speed
- Saves image artifact for container scanning
- Prevents deployment failures

**Container Security Scan** 🛡️
- Scans Docker images with Trivy
- Detects vulnerabilities in OS packages and dependencies
- Uploads results to GitHub Security tab
- Fails on CRITICAL/HIGH severity issues

**Bundle Size Analysis** 📊
- Builds production Next.js bundle
- Reports largest JavaScript files
- Helps prevent bundle bloat
- Outputs report to job summary

**Lighthouse CI** ⚡
- Performance budget enforcement
- Accessibility validation
- SEO checks
- Best practices validation
- Runs against multiple pages (home, work, about, contact)

**E2E Tests** 🧪
- Playwright browser tests
- PostgreSQL service container
- Tests user-facing functionality
- Uploads test reports as artifacts

### 2. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

Runs on:
- Push to `master`
- Pull requests to `master`
- Weekly schedule (Mondays at 2 AM UTC)

#### Features
- Scans for security vulnerabilities in code
- Detects common issues: SQL injection, XSS, path traversal, etc.
- Uses extended security queries
- Results visible in GitHub Security tab

### 3. Deployment Pipeline (`.github/workflows/deploy-production.yml`)

Runs on push to `main` branch (production deployments).

#### Jobs
- Lint and type-check
- Docker build and push to Azure Container Registry
- Deploy to Azure App Service

## Automated Dependency Management

### Dependabot Configuration (`.github/dependabot.yml`)

#### Features
- Weekly updates every Monday at 2 AM UTC
- Separate update groups for:
  - Production dependencies (npm)
  - Development dependencies (npm)
  - GitHub Actions
  - Docker base images
- Groups minor/patch updates together
- Limits to 5 open PRs at a time
- Auto-assigns reviewers
- Labels PRs for easy filtering

#### PR Labels
- `dependencies` - All dependency updates
- `automated` - Automated PRs
- `github-actions` - Action updates
- `docker` - Docker image updates

## Secret Scanning

### GitHub Secret Scanning
- Automatically enabled for public repositories
- Scans for 200+ types of credentials
- Alerts on commits with secrets
- See `.github/secret-scanning.md` for custom patterns

### Protected Secrets
- GitHub tokens
- AWS/Azure credentials
- API keys (Resend, etc.)
- Database connection strings
- PayloadCMS secrets

## Performance Budgets (Lighthouse CI)

### Thresholds

**Performance Scores**
- Performance: ≥ 80
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

**Core Web Vitals**
- First Contentful Paint (FCP): ≤ 2 seconds
- Largest Contentful Paint (LCP): ≤ 2.5 seconds
- Cumulative Layout Shift (CLS): ≤ 0.1
- Total Blocking Time (TBT): ≤ 300ms

**Bundle Sizes**
- JavaScript: ≤ 500 KB
- Total resources: ≤ 2 MB

Configuration: `lighthouserc.js`

## CI Execution Times

| Job | Typical Duration |
|-----|------------------|
| Security Audit | ~10s |
| Lint | ~20s |
| Type Check | ~25s |
| Docker Build | ~3-4 min (with cache) |
| Container Scan | ~1 min |
| Bundle Size | ~2-3 min |
| Lighthouse CI | ~3-4 min |
| E2E Tests | ~2-3 min |

**Total CI time: 12-15 minutes**

## Viewing Results

### Pull Request Checks
All jobs appear in the PR "Checks" tab. Each must pass before merging.

### Security Tab
- Navigate to repository **Security** tab
- **Code scanning** - View CodeQL and Trivy alerts
- **Secret scanning** - View detected secrets
- **Dependabot** - View dependency alerts and updates

### Artifacts
Download from completed workflow runs:
- `playwright-report` - E2E test results (14 days retention)
- `docker-image` - Built Docker image (1 day retention)
- `lighthouse-reports` - Lighthouse CI results (14 days retention)

## Branch Protection Rules (Recommended)

To enforce these checks on every PR:

1. Go to **Settings** → **Branches**
2. Add protection rule for `master` branch
3. Enable:
   - ☑ Require a pull request before merging
   - ☑ Require status checks to pass before merging
   - ☑ Require branches to be up to date before merging
4. Select required status checks:
   - `Security Audit`
   - `Lint`
   - `Type Check`
   - `Docker Build`
   - `Container Security Scan`
   - `Bundle Size Analysis`
   - `Lighthouse CI`
   - `E2E Tests`

## Troubleshooting

### npm audit failures
If audit fails with false positives:
```bash
# View details locally
npm audit

# Check for fixes
npm audit fix

# If unfixable, document reason and temporarily allow:
npm audit --audit-level=critical
```

### Docker build failures
Common causes:
- Missing environment variables (add to workflow)
- Build context issues (check .dockerignore)
- Dependency installation failures

### Trivy scan failures
- Review Security tab for vulnerability details
- Update base images in Dockerfile
- Update vulnerable npm packages
- Add exceptions for false positives if needed

### Lighthouse CI failures
- Check performance metrics in artifact
- Review bundle size increases
- Optimize images and scripts
- Consider code splitting

## Maintenance

### Weekly Tasks (Automated)
- ✅ Dependabot creates update PRs
- ✅ CodeQL scans run automatically

### Monthly Tasks
- Review Dependabot PRs and merge
- Check Security tab for unresolved alerts
- Review bundle size trends
- Update CI action versions if needed

### Quarterly Tasks
- Review and adjust Lighthouse budgets
- Evaluate new security scanning tools
- Update Node.js version in CI
- Review and update documentation

## Adding New Checks

### Example: Add Prettier Check

1. Add to `package.json`:
```json
"scripts": {
  "format:check": "prettier --check ."
}
```

2. Add job to `.github/workflows/ci.yml`:
```yaml
format-check:
  name: Format Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npm run format:check
```

3. Add to branch protection rules

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Queries](https://codeql.github.com/codeql-query-help/)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Bundle Analysis](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
