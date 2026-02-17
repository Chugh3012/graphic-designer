# CI/CD Pipeline Visualization

## CI Workflow Architecture

```
Pull Request to master
         |
         v
    [Trigger CI]
         |
         +------------------------------------------+
         |                                          |
         v                                          v
   [Parallel Jobs]                          [Sequential Jobs]
         |                                          |
    +----+----+                                     |
    |    |    |                                     |
    v    v    v                                     v
  [1]  [2]  [3]                              [4] → [5]
  Sec  Lint Type                             Docker  Trivy
         |    |                              Build   Scan
         v    v                                |      |
        [6]  [7]                               v      v
      Bundle Light                          Results Results
        Size  house                            ↓      ↓
         |     |                           Security Security
         v     v                             Tab     Tab
        [8] E2E Tests
         |
         v
    All Pass ✅
         |
         v
   Ready to Merge
```

## Job Dependency Graph

```
security-audit (10s) ──┐
                       │
lint (20s) ────────────┤
                       │
type-check (25s) ──────┤
                       ├─→ [All must pass]
bundle-size (2-3m) ────┤
                       │
lighthouse (3-4m) ─────┤
                       │
e2e-tests (2-3m) ──────┤
                       │
docker-build (3-4m) ───┴─→ container-scan (1m)
```

## Weekly Automation Schedule

```
Monday 2:00 AM UTC
       |
       v
   [Dependabot]
       |
       +────────────────────────────────+
       |              |                 |
       v              v                 v
   [npm PRs]    [Actions PRs]     [Docker PRs]
   (max 5)         (auto)           (auto)
       |              |                 |
       v              v                 v
   Grouped by    Individual      Base image
   minor/patch     updates         updates
       |              |                 |
       v              v                 v
   Auto-labeled   Auto-labeled    Auto-labeled
   'dependencies' 'github-actions'  'docker'
       |              |                 |
       v              v                 v
   [Manual Review & Merge]
```

## CodeQL Weekly Scan

```
Monday 2:00 AM UTC
       |
       v
   [CodeQL Scan]
       |
       v
   Full codebase
   analysis
       |
       +─────────────+
       |             |
       v             v
   [Security]   [Quality]
   Extended      Checks
   Queries
       |             |
       v             v
   Results → Security Tab
```

## Security Layers

```
Layer 1: Code Security
├── CodeQL (Code analysis)
└── Secret Scanning (Credential detection)

Layer 2: Dependency Security
├── npm audit (Known CVEs)
└── Dependabot (Update PRs)

Layer 3: Container Security
├── Docker Build (Build validation)
└── Trivy (Image scanning)

Layer 4: Runtime Security
└── Lighthouse CI (Browser security headers)
```

## Quality Gates

```
Code Quality
├── ESLint (Style & patterns)
├── TypeScript (Type safety)
└── Prettier (Formatting - future)

Performance
├── Lighthouse CI (Core Web Vitals)
├── Bundle Size (JavaScript weight)
└── E2E Tests (Functional validation)

Build Quality
├── Docker Build (Image creation)
└── npm ci (Dependency integrity)
```

## CI Time Breakdown

```
Total: 14-18 minutes (parallel execution)

Longest Path:
docker-build (4m) → container-scan (1m) = 5 minutes

Parallel Execution:
├── security-audit (10s) ────────────┐
├── lint (20s) ──────────────────────┤
├── type-check (25s) ────────────────┤
├── bundle-size (3m) ────────────────┤ Run in parallel
├── lighthouse (4m) ─────────────────┤ (fastest to slowest)
└── e2e-tests (3m) ──────────────────┘

Bottleneck: lighthouse (4m) + docker→trivy (5m) ≈ 4-5m actual time
```

## Artifact Flow

```
[CI Run] → [Artifacts Generated]
    |
    +─────────────────────────────────────+
    |                |                    |
    v                v                    v
[Playwright]   [Lighthouse]        [Docker Image]
 Reports         Reports               (temp)
 14 days         14 days               1 day
    |                |                    |
    v                v                    v
Download &      Download &           Used by
  Review          Review             Trivy scan
```

## Branch Protection Flow

```
Developer
   |
   v
Create PR
   |
   v
[CI Triggered] ──────────> [8 Required Checks]
   |                              |
   |                         All Pass? ──No──> ❌ Cannot Merge
   |                              |
   |                             Yes
   v                              |
Code Review                       v
Required?                    ✅ Can Merge
   |                              |
  Yes                             v
   |                      [Merge to master]
   v                              |
Approved? ──No──> ⏸️ Wait          |
   |                              v
  Yes                    [Deploy Workflow]
   |                              |
   v                              v
✅ Merge                    Production 🚀
```

## Security Alert Workflow

```
[Security Issue Detected]
         |
         +─────────────────────────────+
         |                             |
         v                             v
   [CodeQL Alert]              [Trivy Alert]
         |                             |
         v                             v
   Code vulnerability          Container vulnerability
         |                             |
         v                             v
   Security Tab                  Security Tab
         |                             |
         v                             v
   Review & Fix                  Update image/deps
         |                             |
         v                             v
   Commit fix                    Commit fix
         |                             |
         v                             v
   CI validates                  CI validates
         |                             |
         v                             v
   Alert dismissed              Alert dismissed
```

## Dependabot PR Workflow

```
Monday 2 AM UTC
      |
      v
[Scan Dependencies]
      |
      +───────────────────────────────────+
      |                                   |
      v                                   v
Security Update?                    Regular Update?
      |                                   |
     Yes                                 Yes
      |                                   |
      v                                   v
Create PR                           Create PR
immediately                         (grouped)
      |                                   |
      +───────────────────────────────────+
                      |
                      v
              [Trigger CI]
                      |
                      v
              All checks pass?
                      |
              +───────┴───────+
              |               |
             Yes              No
              |               |
              v               v
      Ready for review   Fix needed
              |               |
              v               v
      Approve & Merge    Close or fix
```

## Resource Usage

```
GitHub Actions Minutes (per PR)
├── Free tier: 2,000 min/month
└── CI usage: ~18 min/PR

Storage
├── Artifacts: ~50 MB/run
├── Retention: 14 days (reports), 1 day (images)
└── Auto-cleanup: Yes

Caching
├── npm cache: Enabled
├── Docker layer cache: Enabled (GHA)
└── Playwright browsers: Installed fresh each run
```

## Monitoring Dashboard (Recommended)

```
Weekly Check
├── PR merge rate
├── CI failure rate
├── Dependabot PR status
└── Security alert count

Monthly Check
├── CI execution time trends
├── Artifact storage usage
├── Action minute consumption
└── Security posture improvements
```
