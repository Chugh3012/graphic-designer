# Deployment runbook (Azure Container Apps, ~$0/month)

Passwordless pipeline: **GitHub OIDC** to Azure and `GITHUB_TOKEN` to ghcr.io. The
app runs on the Container Apps **free monthly grant** (scale-to-zero), the database
is SQLite on an **Azure Files** share, and images come from **ghcr.io** — so there
is no managed database, registry, or Blob cost.

## One-time setup

### 1. Azure OIDC identity for GitHub Actions
Create an app registration (or user-assigned identity) with a federated credential
for this repo's `production` environment, and grant it **Contributor** on the target
resource group plus **Key Vault Secrets Officer** (to write the secrets at deploy).

### 2. GitHub secrets (repo → Settings → Environments → `production`)

| Secret | Purpose |
|---|---|
| `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` | OIDC login |
| `AZURE_RESOURCE_GROUP` | Target resource group |
| `PAYLOAD_SECRET` | Payload secret (`openssl rand -hex 32`) |
| `ACS_CONNECTION_STRING` | Azure Communication Services string (or empty to disable email) |
| `DEPLOYER_OBJECT_ID` | (optional) your object ID for Key Vault break-glass |

### 3. Make the ghcr.io image public (one-time)
After the first deploy pushes the image, set the **package** visibility to *public*
(repo → Packages → graphic-designer → Package settings). This lets Container Apps
pull it without a registry credential. (Alternatively, add a ghcr PAT as a registry
secret on the Container App.)

### 4. Provision infrastructure
Run the **Provision Infrastructure** workflow (`infra.yml`, manual dispatch). It
deploys [infra/main.bicep](infra/main.bicep): managed identity, Storage account +
Azure Files share, Key Vault (+ secrets), Log Analytics / App Insights, the
Container Apps environment, and the Container App (placeholder image, volume mounted
at `/app/.data`).

## Continuous deployment
Every push to `master` (or manual dispatch) runs
[deploy-production.yml](.github/workflows/deploy-production.yml):

1. Build the image and push to `ghcr.io/<owner>/graphic-designer` (via `GITHUB_TOKEN`).
2. OIDC login to Azure.
3. `az containerapp update` to the new image.
4. Smoke test `https://<fqdn>/healthz`.

The SQLite schema is **auto-synced on boot** — no migration step. The DB file and
uploads persist on the Azure Files share across deploys and scale-to-zero.

## Backups & rollback
- **Data**: the SQLite file + media live on the Azure Files share — enable Azure
  Files **snapshots** (or a scheduled `az storage share snapshot`) for backups.
- **App**: Container Apps keeps revisions —
  `az containerapp revision list … -o table`, then
  `az containerapp ingress traffic set … --revision-weight <prev>=100`.

## Notes
- Single replica (SQLite single-writer) — do not raise `maxReplicas` above 1.
- Branch protection should require CI on PRs to `master` (see [PLAN.md](PLAN.md)).
