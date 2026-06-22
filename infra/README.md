# Infrastructure

The entire hosting topology is a single **Azure Static Web App (Free)** — `$0/month`.
It serves the hybrid Next.js site: static pages plus a managed backend for the
contact server action and the Keystatic admin API. There is no database, storage
account, Key Vault, or Container App — content and images live in this git repo
(Keystatic, a git-based CMS).

## Files

- `main.bicep` — the Static Web App resource (Free tier). Single source of truth.

## Provision

```pwsh
az group create -n rg-graphic-designer -l westeurope
az deployment group create -g rg-graphic-designer --template-file infra/main.bicep
```

## Deploy

CI deploys on push to `master` via `.github/workflows/deploy.yml` using a scoped
SWA **deployment token** (no cloud credentials). Get it and store it as a repo
secret once:

```pwsh
$token = az staticwebapp secrets list -n graphic-designer -g rg-graphic-designer --query "properties.apiKey" -o tsv
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b $token
```

Oryx runs `npm install` + `npm run build` (so the cross-platform `npm ci`
lockfile strictness never applies).

## App settings (request-time env)

Set on the Static Web App resource (never in the repo):

| Setting | Purpose |
| --- | --- |
| `AZURE_COMMUNICATION_CONNECTION_STRING` | Contact-form email (ACS). Leave unset to disable email. |
| `EMAIL_FROM` | Verified ACS sender address. |
| `CONTACT_EMAIL_TO` | Recipient for contact submissions. |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App — enables hosted `/keystatic` admin (GitHub storage mode). |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App secret. |
| `KEYSTATIC_SECRET` | Keystatic OAuth signing secret. |

```pwsh
az staticwebapp appsettings set -n graphic-designer -g rg-graphic-designer `
  --setting-names EMAIL_FROM=you@example.com CONTACT_EMAIL_TO=you@example.com
```

Until the GitHub App vars are set, Keystatic runs in **local mode** (edit via
`npm run dev`); once set, the admin at `/keystatic` edits live and commits to the
repo. Create the App by visiting `/keystatic` in the browser and following the
guided setup, then copy the generated vars into the app settings above.
