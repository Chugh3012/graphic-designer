// ─────────────────────────────────────────────────────────────────────────────
// Graphic Designer Portfolio — Azure infrastructure (single source of truth)
//
// Topology: Azure Container Apps (scale-to-zero capable) fronted by managed
// ingress, with a user-assigned managed identity used for:
//   • passwordless image pull from ACR (AcrPull)
//   • passwordless secret retrieval from Key Vault (Key Vault Secrets User)
//
// Payload's Postgres + Azure Blob adapters require connection strings, so the
// few unavoidable secrets live in Key Vault and are injected into the Container
// App via the managed identity — never stored in the repo or the CI pipeline.
//
// ponytail: Postgres uses password auth (in Key Vault) and public-network +
// firewall access. Ceiling: not VNet-private and not Entra-token auth. Upgrade
// path: add a VNet with private endpoints for Postgres/Storage/Key Vault and
// switch the pg pool to a Microsoft Entra token password provider.
// ─────────────────────────────────────────────────────────────────────────────

@description('Application name used for resource naming.')
param appName string = 'graphic-designer'

@description('Environment name (e.g. production, staging).')
param environmentName string = 'production'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Full container image reference to deploy. CI overrides this with the freshly built image; the default is a placeholder for the very first infra deploy.')
param containerImage string = 'mcr.microsoft.com/k8se/quickstart:latest'

@description('PostgreSQL administrator password (sourced from a CI secret; stored in Key Vault).')
@secure()
param postgresPassword string

@description('Payload CMS secret (sourced from a CI secret; stored in Key Vault).')
@secure()
param payloadSecret string

@description('Azure Communication Services connection string for transactional email.')
@secure()
param acsConnectionString string

@description('Verified sender address for Azure Communication Email.')
param emailFrom string

@description('Recipient address for contact-form submissions.')
param contactEmailTo string

@description('Object ID of the deploying principal, granted Key Vault admin for break-glass access. Leave empty to skip.')
param deployerObjectId string = ''

var resourcePrefix = '${appName}-${environmentName}'
var tags = {
  application: appName
  environment: environmentName
  managedBy: 'bicep'
}

// Stable, globally-unique suffix for resources that need flat names.
var uniqueSuffix = uniqueString(resourceGroup().id, resourcePrefix)
var storageAccountName = toLower(take('${replace(appName, '-', '')}${uniqueSuffix}', 24))
var acrName = toLower(take('${replace(appName, '-', '')}acr${uniqueSuffix}', 50))
var keyVaultName = toLower(take('${replace(appName, '-', '')}kv${uniqueSuffix}', 24))
var databaseName = 'graphic_designer'

// Built-in role definition IDs
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var kvSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'
var kvAdminRoleId = '00482a5a-887f-4fb3-b363-3b7fe8e74483'
var blobDataContributorRoleId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'

// ── Observability ────────────────────────────────────────────────────────────
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

// ── Identity ─────────────────────────────────────────────────────────────────
resource uami 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${resourcePrefix}-id'
  location: location
  tags: tags
}

// ── Container Registry (admin disabled — image pull is via managed identity) ──
resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: acrName
  location: location
  tags: tags
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource acrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, uami.id, acrPullRoleId)
  scope: acr
  properties: {
    principalId: uami.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
  }
}

// ── Storage for portfolio media ──────────────────────────────────────────────
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    // Portfolio media is intentionally public-readable so image URLs resolve
    // directly from Blob (Payload serves blob URLs without proxying).
    allowBlobPublicAccess: true
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'portfolio-media'
  properties: {
    publicAccess: 'Blob'
  }
}

// Allow the app identity to manage blobs (uploads from the admin panel).
resource blobContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, uami.id, blobDataContributorRoleId)
  scope: storageAccount
  properties: {
    principalId: uami.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', blobDataContributorRoleId)
  }
}

// ── PostgreSQL Flexible Server ───────────────────────────────────────────────
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: '${resourcePrefix}-postgres'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'payloadadmin'
    administratorLoginPassword: postgresPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: { mode: 'Disabled' }
    network: { publicNetworkAccess: 'Enabled' }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgresServer
  name: databaseName
}

// Allow Azure services (the Container App) to reach the database.
resource postgresFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ── Key Vault (RBAC) — holds the connection strings the app needs ────────────
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

resource secretDatabaseUri 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'database-uri'
  properties: {
    value: 'postgresql://payloadadmin:${postgresPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${databaseName}?sslmode=require'
  }
}

resource secretPayload 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'payload-secret'
  properties: { value: payloadSecret }
}

resource secretStorage 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'storage-connection-string'
  properties: {
    value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
  }
}

resource secretAcs 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'acs-connection-string'
  properties: { value: acsConnectionString }
}

// ── Container Apps Environment ───────────────────────────────────────────────
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
    acrPull
    kvSecretsUser
    secretDatabaseUri
    secretPayload
    secretStorage
    secretAcs
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
      registries: [
        {
          server: acr.properties.loginServer
          identity: uami.id
        }
      ]
      secrets: [
        {
          name: 'database-uri'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/database-uri'
          identity: uami.id
        }
        {
          name: 'payload-secret'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/payload-secret'
          identity: uami.id
        }
        {
          name: 'storage-connection-string'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/storage-connection-string'
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
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'DATABASE_URI', secretRef: 'database-uri' }
            { name: 'PAYLOAD_SECRET', secretRef: 'payload-secret' }
            { name: 'AZURE_STORAGE_CONNECTION_STRING', secretRef: 'storage-connection-string' }
            { name: 'AZURE_COMMUNICATION_CONNECTION_STRING', secretRef: 'acs-connection-string' }
            { name: 'AZURE_STORAGE_CONTAINER_NAME', value: 'portfolio-media' }
            { name: 'AZURE_CDN_HOSTNAME', value: replace(replace(storageAccount.properties.primaryEndpoints.blob, 'https://', ''), '/', '') }
            { name: 'EMAIL_FROM', value: emailFrom }
            { name: 'CONTACT_EMAIL_TO', value: contactEmailTo }
            { name: 'NEXT_PUBLIC_SITE_URL', value: 'https://${resourcePrefix}-app.${caeEnv.properties.defaultDomain}' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/healthz', port: 3000 }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: { path: '/healthz', port: 3000 }
              initialDelaySeconds: 5
              periodSeconds: 15
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scale'
            http: { metadata: { concurrentRequests: '50' } }
          }
        ]
      }
    }
  }
}

// ── Outputs (consumed by the deploy workflow) ────────────────────────────────
output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
output containerAppName string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output keyVaultName string = keyVault.name
output postgresServerName string = postgresServer.name
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output managedIdentityClientId string = uami.properties.clientId
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output siteUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
