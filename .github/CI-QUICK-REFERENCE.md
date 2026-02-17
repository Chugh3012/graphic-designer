# CI/CD Quick Reference

## Quick Status Check

### View CI Results
```bash
# In a PR, click the "Checks" tab to see all job results
# Or view in GitHub Actions tab → Workflows
```

### Required Checks (All Must Pass)
- ✅ Security Audit (npm audit)
- ✅ Lint (ESLint)
- ✅ Type Check (TypeScript)
- ✅ Docker Build
- ✅ Container Security Scan (Trivy)
- ✅ Bundle Size Analysis
- ✅ Lighthouse CI (Performance)
- ✅ E2E Tests (Playwright)

## Quick Commands

### Local Development
```bash
# Run all checks locally before pushing
npm run lint                    # ESLint
npx tsc --noEmit               # Type check
npm audit --audit-level=high   # Security audit
npm run build                  # Build check
npm run test:e2e              # E2E tests
```

### Docker Testing
```bash
# Test Docker build locally
docker build -t graphic-designer:test .

# Scan locally with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --severity HIGH,CRITICAL graphic-designer:test
```

### Bundle Analysis
```bash
# Build and check bundle size
npm run build
du -sh .next/static
```

## Common Issues & Quick Fixes

### npm audit fails
```bash
# View details
npm audit

# Attempt automatic fix
npm audit fix

# If can't fix, review and document
npm audit --json > audit-report.json
```

### Docker build fails
```bash
# Test locally first
docker build --no-cache -t test .

# Check .dockerignore includes:
node_modules
.next
.git
```

### Lighthouse fails
```bash
# Run locally
npm install -g @lhci/cli
npm run build
npm start &
lhci autorun
```

### Trivy finds vulnerabilities
```bash
# Update base image in Dockerfile
FROM node:20-alpine  # Use latest patch

# Update dependencies
npm update
npm audit fix
```

## Dependabot PRs

### Auto-Created Weekly (Mondays 2 AM UTC)
- Production dependencies (grouped)
- Development dependencies (grouped)
- GitHub Actions updates
- Docker base image updates

### Review Process
1. Check CI passes ✅
2. Review changelog/release notes
3. Test locally if major update
4. Merge if all green

## Performance Budgets

### Current Thresholds
- **Performance Score:** ≥ 80
- **Accessibility:** ≥ 90
- **LCP:** ≤ 2.5s
- **CLS:** ≤ 0.1
- **JavaScript:** ≤ 500 KB
- **Total Resources:** ≤ 2 MB

### If Budget Exceeded
1. Review Lighthouse report artifact
2. Optimize images (use Next.js Image)
3. Code split large components
4. Defer non-critical scripts

## Security Tab Quick Guide

### CodeQL Alerts
- Location: Security → Code scanning
- Review: Click alert → See code → Fix issue
- Dismiss: Only if false positive (add comment)

### Trivy Alerts
- Location: Security → Code scanning
- Shows: Container vulnerabilities
- Fix: Update base image or dependencies

### Dependabot Alerts
- Location: Security → Dependabot
- Auto-PRs: Created for fixes
- Review: Check compatibility, merge

## Workflow Triggers

### CI (`ci.yml`)
- Trigger: Pull requests to `master`
- Duration: 14-18 minutes
- Artifacts: Playwright reports, Lighthouse reports, Docker image

### CodeQL (`codeql.yml`)
- Trigger: PRs, pushes to `master`, weekly Monday 2 AM
- Duration: 3-5 minutes
- Results: Security tab

### Dependabot
- Trigger: Weekly Monday 2 AM
- Creates: Up to 5 PRs
- Labels: `dependencies`, `automated`

## Emergency: Skip CI Check

**⚠️ Only for urgent hotfixes - requires admin approval**

```bash
# Add to commit message
git commit -m "hotfix: critical issue [skip ci]"
```

**Better: Fix issue properly and let CI validate**

## Useful Links

- [Full Documentation](.github/CI-CD-DOCUMENTATION.md)
- [CodeQL Queries](https://codeql.github.com/codeql-query-help/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)

## Monitoring CI Health

### Weekly Review
- [ ] Check Dependabot PRs (merge or close)
- [ ] Review Security tab for new alerts
- [ ] Monitor CI execution times (trending up?)
- [ ] Check artifact storage usage

### Monthly Review
- [ ] Update GitHub Actions versions
- [ ] Review Lighthouse budget adjustments
- [ ] Check for new security scanning tools
- [ ] Update documentation

## Getting Help

1. Check `.github/CI-CD-DOCUMENTATION.md` for detailed docs
2. Review job logs in GitHub Actions tab
3. Test locally with same commands CI uses
4. Check GitHub Actions status page for outages
