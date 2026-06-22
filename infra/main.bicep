// ─────────────────────────────────────────────────────────────────────────────
// Graphic Designer Portfolio — Azure infrastructure (single source of truth)
//
// Minimal, ~$0/month topology:
//   • Azure Container Apps  — scale-to-zero, max 1 replica, inside the free grant
//   • Azure Files share     — holds the SQLite database file AND media uploads
//   • Key Vault             — PAYLOAD_SECRET + email connection string (MI-read)
//   • Log Analytics + App Insights (free tier)
//
// No managed database, no container registry (images come from ghcr.io), no Blob.
// The app's managed identity reads secrets from Key Vault; the deploy pipeline
// uses GitHub OIDC. The only unavoidable key is the storage-account key used by
// the Container Apps Azure Files mount (held in the managed-environment config,
// never in the repo).
//
// ponytail: SQLite lives on an SMB (Azure Files) share, so the app runs at a
// single writer — minReplicas 0, maxReplicas 1. Fine for a read-heavy portfolio
// with one admin. Upgrade path if write concurrency is ever needed: Turso
// (libSQL, free) or a managed Postgres.
// ─────────────────────────────────────────────────────────────────────────────

@description('Application name used for resource naming.')
param appName string = 'graphic-designer'

@description('Environment name (e.g. production, staging).')
param environmentName string = 'production'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Full container image reference to deploy (e.g. ghcr.io/owner/graphic-designer:sha). The default placeholder is used for the first infra deploy; CI overrides it.')
param containerImage string = 'mcr.microsoft.com/k8se/quickstart:latest'

@description('Payload CMS secret (openssl rand -hex 32). Stored in Key Vault.')
@secure()
param payloadSecret string

@description('Azure Communication Services connection string for the contact-form email. Stored in Key Vault. Leave empty to disable email.')
@secure()
param acsConnectionString string = ''

@description('Verified sender address for Azure Communication Email.')
param emailFrom string = 'DoNotReply@example.com'

@description('Recipient address for contact-form submissions.')
param contactEmailTo string = ''

@description('Object ID of the deploying principal, granted Key Vault admin for break-glass access. Leave empty to skip.')
param deployerObjectId string = ''

var resourcePrefix = '${appName}-${environmentName}'
var tags = {
  application: appName
  environment: environmentName
  managedBy: 'bicep'
}

var uniqueSuffix = uniqueString(resourceGroup().id, resourcePrefix)
var storageAccountName = toLower(take('${replace(appName, '-', '')}${uniqueSuffix}', 24))
var keyVaultName = toLower(take('${replace(appName, '-', '')}kv${uniqueSuffix}', 24))
var fileShareName = 'appdata'
var mountPath = '/app/.data'

var kvSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'
var kvAdminRoleId = '00482a5a-887f-4fb3-b363-3b7fe8e74483'

// ── Observability (free tier) ────────────────────────────────────────────────
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${resourcePrefix}-logs'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${resourcePrefix}-insights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    RetentionInDays: 90
  }
}

// ── Identity (used to read Key Vault secrets) ────────────────────────────────
resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${resourcePrefix}-id'
  location: location
  tags: tags
}

// ── Storage account + file share (SQLite DB + media uploads) ─────────────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource fileService 'Microsoft.Storage/storageAccounts/fileServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2023-05-01' = {
  parent: fileService
  name: fileShareName
  properties: {
    shareQuota: 16
    enabledProtocols: 'SMB'
  }
}

// ── Key Vault (RBAC) ─────────────────────────────────────────────────────────
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
}

resource kvSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, uami.id, kvSecretsUserRoleId)
  scope: keyVault
  properties: {
    principalId: uami.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', kvSecretsUserRoleId)
  }
}

resource kvAdmin 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(deployerObjectId)) {
  name: guid(keyVault.id, deployerObjectId, kvAdminRoleId)
  scope: keyVault
  properties: {
    principalId: deployerObjectId
    principalType: 'User'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', kvAdminRoleId)
  }
}

resource secretPayload 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'payload-secret'
  properties: { value: payloadSecret }
}

resource secretAcs 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'acs-connection-string'
  properties: { value: empty(acsConnectionString) ? 'unset' : acsConnectionString }
}

// ── Container Apps Environment + Azure Files storage link ────────────────────
resource caeEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${resourcePrefix}-env'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource caeStorage 'Microsoft.App/managedEnvironments/storages@2024-03-01' = {
  parent: caeEnv
  name: fileShareName
  properties: {
    azureFile: {
      accountName: storageAccount.name
      accountKey: storageAccount.listKeys().keys[0].value
      shareName: fileShareName
      accessMode: 'ReadWrite'
    }
  }
}

// ── Container App (web) ──────────────────────────────────────────────────────
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${resourcePrefix}-app'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uami.id}': {}
    }
  }
  dependsOn: [
    kvSecretsUser
    secretPayload
    secretAcs
    caeStorage
  ]
  properties: {
    managedEnvironmentId: caeEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
      secrets: [
        {
          name: 'payload-secret'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/payload-secret'
          identity: uami.id
        }
        {
          name: 'acs-connection-string'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/acs-connection-string'
          identity: uami.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          volumeMounts: [
            {
              volumeName: fileShareName
              mountPath: mountPath
            }
          ]
          env: [
            { name: 'NODE_ENV', value: 'production' }
            // SQLite database file + media uploads live on the mounted Azure Files share.
            { name: 'DATABASE_URI', value: 'file:${mountPath}/portfolio.db' }
            { name: 'MEDIA_DIR', value: '${mountPath}/media' }
            { name: 'PAYLOAD_SECRET', secretRef: 'payload-secret' }
            { name: 'AZURE_COMMUNICATION_CONNECTION_STRING', secretRef: 'acs-connection-string' }
            { name: 'EMAIL_FROM', value: emailFrom }
            { name: 'CONTACT_EMAIL_TO', value: contactEmailTo }
            { name: 'NEXT_PUBLIC_SITE_URL', value: 'https://${resourcePrefix}-app.${caeEnv.properties.defaultDomain}' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/healthz', port: 3000 }
              initialDelaySeconds: 15
              periodSeconds: 30
            }
          ]
        }
      ]
      volumes: [
        {
          name: fileShareName
          storageType: 'AzureFile'
          storageName: fileShareName
        }
      ]
      scale: {
        // Single writer for SQLite-on-SMB. Scales to zero when idle (free grant).
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
}

// ── Outputs ──────────────────────────────────────────────────────────────────
output containerAppName string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output keyVaultName string = keyVault.name
output storageAccountName string = storageAccount.name
output managedIdentityClientId string = uami.properties.clientId
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output siteUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
