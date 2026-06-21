# Testing

Two layers, both gated in CI:

## Unit tests — `npm run test:unit`

Stdlib `node:test` + `node:assert` run through `tsx` (no extra framework). Live in
[tests/unit](tests/unit). Cover the non-trivial pure logic:

- `rate-limit.test.ts` — fixed-window limiter (allow/block/reset/independent keys)
- `validations.test.ts` — contact-form Zod schema (valid, bad email, short message, honeypot)

Add a test alongside any new non-trivial pure function.

## E2E tests — `npm run test:e2e`

Playwright specs in [tests/e2e](tests/e2e). The config auto-starts `next dev` on
:3000, which creates a local SQLite database on first run — no database server
needed. Useful variants:

```bash
npm run test:e2e:ui       # interactive
npm run test:e2e:headed   # visible browser
npm run test:e2e:debug    # Playwright Inspector
npx playwright test tests/e2e/contact-form.spec.ts        # single file
npx playwright test -g "should display contact form"      # single test
```

Prefer accessibility-first selectors (`getByRole`, `getByLabel`, `getByText`); add
`data-testid` only when semantics are insufficient.

## CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on PRs to `master`:
security audit (`npm audit --audit-level=high`), lint, type-check, unit tests,
Docker build, Trivy container scan, bundle-size, Lighthouse, and E2E.
