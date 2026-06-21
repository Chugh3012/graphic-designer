# Deployment runbook (Azure Container Apps)

Authentication is entirely passwordless: GitHub OIDC for the pipeline, managed
identity for ACR pull and Key Vault reads. No service-principal secret or registry
password is stored anywhere.

## One-time setup

### 1. Azure AD app + federated credentials (OIDC)

Create an app registration (or user-assigned identity) for GitHub Actions and add a
federated credential for this repo's `production` environment. Grant it on the
target resource group:

- **Contributor** (deploy infra, build images, update the Container App, manage the
  temporary DB firewall rule during migrations)
- **Key Vault Secrets User** (read `database-uri` / `payload-secret` at deploy time)

### 2. GitHub secrets (repo → Settings → Environments → `production`)

| Secret | Purpose |
|---|---|
| `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` | OIDC login |
| `AZURE_RESOURCE_GROUP` | Target resource group |
| `POSTGRES_PASSWORD` | Postgres admin password (stored into Key Vault by Bicep) |
| `PAYLOAD_SECRET` | Payload secret (`openssl rand -hex 32`) |
| `ACS_CONNECTION_STRING` | Azure Communication Services connection string |
| `DEPLOYER_OBJECT_ID` | (optional) your object ID for Key Vault break-glass access |

### 3. Provision infrastructure

Run the **Provision Infrastructure** workflow (`infra.yml`, manual dispatch). It
runs a what-if then `az deployment group create` against
[infra/main.bicep](infra/main.bicep), creating: managed identity, ACR, Storage +
media container, Postgres, Key Vault (+ secrets), Log Analytics / App Insights, the
Container Apps environment, and the Container App (with a placeholder image).

## Continuous deployment

Every push to `master` (or manual dispatch) runs
[deploy-production.yml](.github/workflows/deploy-production.yml):

1. OIDC login to Azure.
2. `az acr build` — builds and pushes the image in ACR (passwordless).
3. Open a temporary Postgres firewall rule for the runner IP.
4. `npm run migrate` against the production DB (URI read from Key Vault).
5. Close the temporary firewall rule (always, even on failure).
6. `az containerapp update` — roll out the new image.
7. Smoke test `https://<fqdn>/healthz` (expects 200).

## Rollback

Container Apps keeps revisions. To roll back:

```bash
az containerapp revision list -g <rg> -n graphic-designer-production-app -o table
az containerapp ingress traffic set -g <rg> -n graphic-designer-production-app \
  --revision-weight <previous-revision>=100
```

Migrations have `down` statements; revert the last batch with
`npm run migrate:down` (run via the same temporary-firewall pattern).

## Notes

- Branch protection should require CI on PRs to `master` (see [PLAN.md](PLAN.md)).
- First deploy: provision infra first (placeholder image), then the deploy workflow
  builds the real image and rolls it out.
