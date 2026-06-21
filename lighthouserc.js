module.exports = {
  ci: {
    collect: {
      // Run against the dev server
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/work',
        'http://localhost:3000/about',
        'http://localhost:3000/contact',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      // Performance budgets. Kept as warnings (not errors) so a noisy CI runner
      // or an unseeded preview DB can't flake the PR. Scores are still collected
      // and reported; treat regressions seriously when reviewing the report.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Specific metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Bundle size
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }], // 2MB
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
