# Infrastructure Deployment Guide

## ✅ Improvements Implemented

This update addresses the critical infrastructure gaps identified in the tech stack review:

### 1. **Infrastructure as Code (Bicep Templates)** ✅
- Created `infra/main.bicep` - Complete Azure infrastructure definition
- All resources deployed to **West Europe** region by default
- Automated provisioning with proper configuration

### 2. **Application Insights Monitoring** ✅
- Added `@azure/monitor-opentelemetry` for telemetry
- Created `src/instrumentation.ts` for Next.js integration
- Automatic request/response tracking, performance metrics, error logging

### 3. **Database Backup Policy** ✅
- PostgreSQL configured with 7-day backup retention
- Auto-grow storage enabled (starts at 32GB)
- Point-in-time restore capability

### 4. **Blob Storage Cache Headers** ✅
- Updated `src/payload.config.ts` with cache-control headers
- Images cached for 1 year (`max-age=31536000, immutable`)
- CDN serves cached images without origin requests

---

## 🌍 West Europe Deployment

All resources are configured for **West Europe (`westeurope`)** region by default.

### Check Your Current Region

If you already have Azure resources deployed, check their location:

```bash
# Login to Azure
az login

# Check App Service location
az webapp show \
  --name <YOUR-APP-NAME> \
  --resource-group <YOUR-RG-NAME> \
  --query location -o tsv

# Check PostgreSQL location
az postgres flexible-server show \
  --name <YOUR-POSTGRES-NAME> \
  --resource-group <YOUR-RG-NAME> \
  --query location -o tsv

# Check Storage Account location
az storage account show \
  --name <YOUR-STORAGE-NAME> \
  --resource-group <YOUR-RG-NAME> \
  --query location -o tsv

# List ALL resources with locations
az resource list \
  --resource-group <YOUR-RG-NAME> \
  --query "[].{Name:name, Type:type, Location:location}" \
  --output table
```

### Deploy New Infrastructure to West Europe

```bash
# 1. Set variables
RESOURCE_GROUP="graphic-designer-rg"
LOCATION="westeurope"
POSTGRES_PASSWORD="YourSecurePassword123!"
PAYLOAD_SECRET=$(openssl rand -hex 32)
RESEND_API_KEY="re_xxxxxxxxxxxx"
CONTACT_EMAIL="your-email@example.com"

# 2. Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# 3. Deploy infrastructure
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters \
    environmentName=production \
    location=$LOCATION \
    appName=graphic-designer \
    postgresPassword=$POSTGRES_PASSWORD \
    payloadSecret=$PAYLOAD_SECRET \
    resendApiKey=$RESEND_API_KEY \
    contactEmailTo=$CONTACT_EMAIL

# 4. Get outputs for GitHub Actions
az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs
```

---

## 📊 Monitoring & Observability

### Application Insights Dashboard

After deployment, access Application Insights:

```bash
# Get Application Insights URL
az portal dashboard show \
  --name graphic-designer-production-insights \
  --resource-group graphic-designer-rg
```

**Or via Azure Portal:**
1. Navigate to: Azure Portal → Application Insights → `graphic-designer-production-insights`
2. View:
   - **Live Metrics** - Real-time request rates, response times, errors
   - **Failures** - Exception tracking, failed requests
   - **Performance** - Slowest operations, dependencies
   - **Logs** - Query telemetry with KQL

### Enable App Service Logging

```bash
az webapp log config \
  --name graphic-designer-production-app \
  --resource-group graphic-designer-rg \
  --application-logging azureblobstorage \
  --level information \
  --docker-container-logging filesystem
```

### Stream Logs in Real-Time

```bash
az webapp log tail \
  --name graphic-designer-production-app \
  --resource-group graphic-designer-rg
```

---

## 🔄 Migration from Existing Region to West Europe

If your resources are **NOT** in West Europe:

### Step 1: Backup Current Data

```bash
# Backup PostgreSQL
pg_dump -h OLD-SERVER.postgres.database.azure.com \
  -U payloadadmin \
  -d graphic_designer \
  -F c -f backup.dump

# Backup blob storage
az storage blob download-batch \
  --source portfolio-media \
  --destination ./media-backup \
  --account-name OLD-STORAGE-ACCOUNT
```

### Step 2: Deploy to West Europe

```bash
# Deploy new infrastructure (use commands above)
az deployment group create \
  --resource-group graphic-designer-westeu-rg \
  --template-file infra/main.bicep \
  --parameters location=westeurope ...
```

### Step 3: Restore Data

```bash
# Restore PostgreSQL
pg_restore -h NEW-SERVER.postgres.database.azure.com \
  -U payloadadmin \
  -d graphic_designer \
  --no-owner --role=payloadadmin \
  backup.dump

# Upload media to new storage
az storage blob upload-batch \
  --destination portfolio-media \
  --source ./media-backup \
  --account-name NEW-STORAGE-ACCOUNT \
  --content-cache-control "public, max-age=31536000, immutable"
```

### Step 4: Update GitHub Secrets

Update repository secrets with new values:

```bash
# Get ACR credentials
az acr credential show --name graphicdesignerproductionacr

# Get service principal
az ad sp create-for-rbac \
  --name "github-actions-graphic-designer" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/graphic-designer-westeu-rg \
  --sdk-auth
```

Update in GitHub: **Settings → Secrets and variables → Actions**
- `ACR_REGISTRY`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_APP_SERVICE_NAME`
- `AZURE_CREDENTIALS`

### Step 5: Deploy Application

Push to `main` branch to trigger CI/CD:
```bash
git push origin main
```

### Step 6: Verify & Cleanup

```bash
# Test new application
curl https://graphic-designer-production-app.azurewebsites.net

# After verification, delete old resource group
az group delete \
  --name OLD-RESOURCE-GROUP-NAME \
  --yes \
  --no-wait
```

---

## 🚨 Troubleshooting

### Issue: West Europe Not Available

If you get an error about West Europe not being available for your subscription:

```bash
# Check available locations for App Service
az appservice list-locations --sku B2 --linux-workers-enabled

# Check available locations for PostgreSQL
az postgres flexible-server list-skus --location westeurope
```

**Alternative EU regions** if West Europe is unavailable:
- `northeurope` (Ireland)
- `francecentral` (Paris)
- `germanywestcentral` (Frankfurt)

Update deployment command:
```bash
az deployment group create ... --parameters location=northeurope
```

### Issue: Application Insights Not Working

```bash
# Verify connection string is set
az webapp config appsettings list \
  --name graphic-designer-production-app \
  --resource-group graphic-designer-rg \
  --query "[?name=='APPLICATIONINSIGHTS_CONNECTION_STRING']"

# Check instrumentation is enabled in Next.js
# Verify src/instrumentation.ts exists and is exported
```

### Issue: Images Not Cached by CDN

```bash
# Check CDN endpoint status
az cdn endpoint show \
  --name graphic-designer-production-media \
  --profile-name graphic-designer-production-cdn \
  --resource-group graphic-designer-rg \
  --query provisioningState

# Purge CDN cache and test
az cdn endpoint purge \
  --name graphic-designer-production-media \
  --profile-name graphic-designer-production-cdn \
  --resource-group graphic-designer-rg \
  --content-paths "/*"
```

Test cache headers:
```bash
curl -I https://YOUR-CDN-ENDPOINT.azureedge.net/portfolio-media/test-image.jpg
# Look for: Cache-Control: public, max-age=31536000, immutable
```

---

## 📋 Next Steps

1. **Deploy infrastructure** using commands in this guide
2. **Configure GitHub Actions secrets** with deployment outputs
3. **Push to main branch** to trigger first deployment
4. **Create first admin user** at `/admin`
5. **Upload portfolio projects** and media
6. **Monitor Application Insights** for performance and errors
7. **Set up cost alerts** (optional, see `infra/README.md`)

---

## 📚 Additional Documentation

- Full infrastructure details: `infra/README.md`
- Bicep template: `infra/main.bicep`
- Parameter file: `infra/parameters.json`

## 💰 Estimated Costs

All services in West Europe:
- App Service (B2): ~$26/mo
- PostgreSQL (B1ms): ~$15/mo
- Storage + CDN: ~$7-15/mo
- Application Insights: ~$2-5/mo

**Total: ~$50-65/month**
