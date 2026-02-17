# Graphic Designer Portfolio

[![CI](https://github.com/Chugh3012/graphic-designer/actions/workflows/ci.yml/badge.svg)](https://github.com/Chugh3012/graphic-designer/actions/workflows/ci.yml)
[![Deploy to Production](https://github.com/Chugh3012/graphic-designer/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/Chugh3012/graphic-designer/actions/workflows/deploy-production.yml)
[![CodeQL](https://github.com/Chugh3012/graphic-designer/actions/workflows/codeql.yml/badge.svg)](https://github.com/Chugh3012/graphic-designer/actions/workflows/codeql.yml)

A modern portfolio website for a graphic designer built with Next.js 15 and PayloadCMS 3.

## 🚀 Features

- **Modern Stack**: Next.js 15 (App Router), PayloadCMS 3, PostgreSQL, TypeScript
- **Styling**: Tailwind CSS 4 with custom design system
- **CMS**: Self-hosted PayloadCMS for content management
- **Media**: Azure Blob Storage + CDN integration
- **Email**: Contact form with email notifications
- **Performance**: Optimized with Lighthouse CI budgets enforced
- **Security**: CodeQL scanning, npm audit, and Trivy container scanning
- **Testing**: E2E tests with Playwright
- **CI/CD**: Automated GitHub Actions workflows

## 📋 Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- npm or pnpm

## 🛠️ Development

```bash
# Install dependencies
npm ci

# Start PostgreSQL database
docker-compose up -d

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run type checking
npx tsc --noEmit

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t graphic-designer .

# Run container
docker run -p 3000:3000 --env-file .env graphic-designer
```

## 📊 CI/CD Status

For detailed information about CI/CD configuration and current status, see [CI-STATUS.md](./CI-STATUS.md).

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [CI Implementation](./CI-IMPLEMENTATION-SUMMARY.md)
- [Infrastructure Improvements](./INFRASTRUCTURE-IMPROVEMENTS.md)
- [Workflow Gaps Fixed](./WORKFLOW-GAPS-FIXED.md)

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URI` - PostgreSQL connection string
- `PAYLOAD_SECRET` - JWT secret for PayloadCMS
- `AZURE_STORAGE_CONNECTION_STRING` - Azure Blob Storage (optional)
- `AZURE_CDN_HOSTNAME` - Azure CDN hostname (optional)
- `RESEND_API_KEY` - For contact form emails
- `CONTACT_EMAIL_TO` - Email recipient for contact form
- `NEXT_PUBLIC_SITE_URL` - Base site URL

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]
