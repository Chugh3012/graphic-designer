# Infrastructure as Code - Azure Bicep

This directory contains Bicep templates to provision all Azure resources for the Graphic Designer Portfolio application in **West Europe** region.

## Resources Provisioned

All resources are deployed to **West Europe (`westeurope`)** region:

- **Azure Container Registry (Basic)** - Docker image storage (~$5/mo)
- **Azure Storage Account (Standard LRS, Hot)** - Portfolio media/images (~$2-5/mo)
  - Blob container: `portfolio-media`
- **Azure CDN (Standard Microsoft)** - Global image delivery (~$5-10/mo)
  - 7-day cache for images
  - Compression enabled
- **PostgreSQL Flexible Server (B1ms, Burstable)** - Database (~$15/mo)
  - Version: PostgreSQL 16
  - Storage: 32GB with auto-grow
  - Backup: 7-day retention, no geo-redundancy
- **Application Insights + Log Analytics** - Monitoring (~$2-5/mo)
  - 90-day retention for App Insights
  - 30-day retention for logs
- **App Service Plan (B2, Linux)** - Container hosting (~$26/mo)
- **App Service** - Next.js + PayloadCMS application

**Total Cost:** ~$55-65/month

## Prerequisites

1. **Azure CLI** installed and logged in:
   ```bash
   az login
   ```

2. **Active Azure subscription** with permissions to create resources

3. **Secrets prepared:**
   - PostgreSQL admin password (strong, 8+ chars)
   - Payload CMS secret (generate with: `openssl rand -hex 32`)
   - Resend API key (from https://resend.com)
   - Contact email address

## Deployment

### Option 1: Deploy with CLI (Recommended)

```bash
# 1. Set variables
RESOURCE_GROUP="graphic-designer-rg"
LOCATION="westeurope"
POSTGRES_PASSWORD="YourSecurePassword123!"
PAYLOAD_SECRET=$(openssl rand -hex 32)
RESEND_API_KEY="re_xxxxxxxxxxxx"
CONTACT_EMAIL="your-email@example.com"

# 2. Create resource group in West Europe
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# 3. Deploy infrastructure
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file main.bicep \
  --parameters \
    environmentName=production \
    location=$LOCATION \
    appName=graphic-designer \
    postgresPassword=$POSTGRES_PASSWORD \
    payloadSecret=$PAYLOAD_SECRET \
    resendApiKey=$RESEND_API_KEY \
    contactEmailTo=$CONTACT_EMAIL

# 4. Get outputs for GitHub Actions secrets
az deployment group show \
  --resource-group $RESOURCE_GROUP \
  --name main \
  --query properties.outputs
```

### Option 2: Deploy with Parameter File

1. **Edit `parameters.json`** (replace placeholders):
   - Update `{subscription-id}`, `{rg-name}`, `{vault-name}` if using Key Vault
   - Or remove Key Vault references and use direct values (less secure)

2. **Deploy:**
   ```bash
   az group create --name graphic-designer-rg --location westeurope
   
   az deployment group create \
     --resource-group graphic-designer-rg \
     --template-file main.bicep \
     --parameters @parameters.json
   ```

## Checking Current Region

To see which region your existing resources are in (if you already have infrastructure):

```bash
# Check App Service location
az webapp show \
  --name YOUR-APP-NAME \
  --resource-group YOUR-RG-NAME \
  --query location -o tsv

# Check PostgreSQL location
az postgres flexible-server show \
  --name YOUR-POSTGRES-NAME \
  --resource-group YOUR-RG-NAME \
  --query location -o tsv

# Check Storage Account location
az storage account show \
  --name YOUR-STORAGE-NAME \
  --resource-group YOUR-RG-NAME \
  --query location -o tsv

# List all resources in a resource group with their locations
az resource list \
  --resource-group YOUR-RG-NAME \
  --query "[].{Name:name, Type:type, Location:location}" \
  --output table
```

## Migrating to West Europe

If your current resources are **NOT** in West Europe, you need to:

### 1. Export Data
```bash
# Export PostgreSQL database
pg_dump -h YOUR-CURRENT-DB.postgres.database.azure.com \
  -U payloadadmin \
  -d graphic_designer \
  -F c -f backup.dump

# Download blob storage media (using Azure Storage Explorer or CLI)
az storage blob download-batch \
  --source portfolio-media \
  --destination ./media-backup \
  --account-name YOUR-STORAGE-ACCOUNT
```

### 2. Deploy New Infrastructure in West Europe
```bash
# Use the deployment commands above with location=westeurope
az deployment group create \
  --resource-group graphic-designer-westeu-rg \
  --template-file main.bicep \
  --parameters location=westeurope ...
```

### 3. Migrate Data
```bash
# Restore PostgreSQL
pg_restore -h NEW-DB.postgres.database.azure.com \
  -U payloadadmin \
  -d graphic_designer \
  backup.dump

# Upload media to new storage
az storage blob upload-batch \
  --destination portfolio-media \
  --source ./media-backup \
  --account-name NEWSTORAGEACCOUNT
```

### 4. Update GitHub Secrets
Update these secrets with new values from deployment outputs:
- `ACR_REGISTRY`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `AZURE_APP_SERVICE_NAME`

## GitHub Actions Integration

After deployment, configure these GitHub repository secrets:

```bash
# Get ACR credentials
az acr credential show --name <registry-name>

# Set in GitHub: Settings → Secrets → Actions
ACR_REGISTRY=<registry-name>.azurecr.io
ACR_USERNAME=<from above>
ACR_PASSWORD=<from above>
AZURE_APP_SERVICE_NAME=<app-service-name>
AZURE_CREDENTIALS=<service-principal-json>
```

Create service principal for GitHub Actions:
```bash
az ad sp create-for-rbac \
  --name "github-actions-graphic-designer" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth
```

## Monitoring & Observability

### Application Insights
- View logs: Azure Portal → Application Insights → Logs
- Query example:
  ```kusto
  traces
  | where timestamp > ago(1h)
  | order by timestamp desc
  ```

### App Service Logs
Enable application logging in Azure Portal:
```bash
az webapp log config \
  --name <app-name> \
  --resource-group <rg-name> \
  --application-logging filesystem \
  --level information
```

Stream logs:
```bash
az webapp log tail \
  --name <app-name> \
  --resource-group <rg-name>
```

## Database Backup Verification

Check backup policy:
```bash
az postgres flexible-server show \
  --name <server-name> \
  --resource-group <rg-name> \
  --query backup
```

Manual backup:
```bash
az postgres flexible-server backup create \
  --name <server-name> \
  --resource-group <rg-name> \
  --backup-name manual-backup-$(date +%Y%m%d)
```

## Cost Management

Monitor costs:
```bash
# Check current month costs for resource group
az consumption usage list \
  --start-date $(date -d "$(date +%Y-%m-01)" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[?contains(instanceId, 'graphic-designer')].{Name:instanceName, Cost:pretaxCost}"
```

Set budget alert:
```bash
az consumption budget create \
  --budget-name graphic-designer-monthly \
  --amount 100 \
  --time-grain Monthly \
  --resource-group graphic-designer-rg
```

## Cleanup

To delete all resources:
```bash
az group delete \
  --name graphic-designer-rg \
  --yes \
  --no-wait
```

## Troubleshooting

### Issue: "Location not available for subscription"
Some Azure services may not be available in West Europe for your subscription tier. Check available locations:
```bash
# Check App Service Plan locations
az appservice list-locations --sku B2 --linux-workers-enabled

# Check PostgreSQL locations
az postgres flexible-server list-skus --location westeurope
```

If West Europe is not available, alternative EU regions:
- `northeurope` (Ireland)
- `francecentral` (Paris)
- `germanywestcentral` (Frankfurt)

Update `location` parameter in deployment command or `parameters.json`.

### Issue: PostgreSQL connection fails
1. Check firewall rules allow your IP
2. Verify connection string format includes `?sslmode=require`
3. Test connection:
   ```bash
   psql "postgresql://payloadadmin:PASSWORD@SERVER.postgres.database.azure.com:5432/graphic_designer?sslmode=require"
   ```

### Issue: CDN not serving images
1. Wait 10-15 minutes for CDN propagation
2. Verify blob storage has public read access via CDN origin
3. Check CDN endpoint status:
   ```bash
   az cdn endpoint show \
     --name <endpoint-name> \
     --profile-name <profile-name> \
     --resource-group <rg-name> \
     --query provisioningState
   ```
