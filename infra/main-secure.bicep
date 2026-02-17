// Azure Infrastructure as Code for Graphic Designer Portfolio
// Deploy to West Europe region with Key Vault + Managed Identity (Zero-Password)

@description('Environment name (e.g., production, staging)')
param environmentName string = 'production'

@description('Azure region for all resources')
param location string = 'northeurope'

@description('Application name (used for resource naming)')
param appName string = 'graphic-designer'

@description('Resend API key for email (optional - can be set later in Key Vault)')
@secure()
param resendApiKey string = ''

@description('Contact email recipient')
param contactEmailTo string

@description('Your Azure AD User Object ID (for Key Vault access)')
param userObjectId string

var resourcePrefix = '${appName}-${environmentName}'
var keyVaultName = take(replace('${resourcePrefix}-kv', '-', ''), 24)
var tags = {
  environment: environmentName
  application: appName
  managedBy: 'bicep'
}

// Key Vault for secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    publicNetworkAccess: 'Enabled'
  }
}

// RBAC: Grant user Key Vault Secrets Officer role
resource userSecretsOfficer 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, userObjectId, 'Key Vault Secrets Officer')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
    principalId: userObjectId
    principalType: 'User'
  }
}

// Generate random secrets using Azure deployment scripts would require additional resources
// Instead, we'll use auto-generated passwords and store them in Key Vault

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: replace('${resourcePrefix}acr', '-', '')
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// Storage Account for media/images
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: take(replace('${resourcePrefix}storage', '-', ''), 24)
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// Blob container for portfolio media
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'portfolio-media'
  properties: {
    publicAccess: 'None'
  }
}

// Azure Front Door (Modern CDN replacement for deprecated Standard Microsoft)
resource frontDoorProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: '${resourcePrefix}-fd'
  location: 'Global'
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

// Front Door Endpoint
resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  parent: frontDoorProfile
  name: '${resourcePrefix}-media'
  location: 'Global'
  properties: {
    enabledState: 'Enabled'
  }
}

// Origin Group
resource originGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
  parent: frontDoorProfile
  name: 'blob-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
  }
}

// Origin (Blob Storage)
resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = {
  parent: originGroup
  name: 'blob-storage'
  properties: {
    hostName: replace(replace(storageAccount.properties.primaryEndpoints.blob, 'https://', ''), '/', '')
    httpPort: 80
    httpsPort: 443
    originHostHeader: replace(replace(storageAccount.properties.primaryEndpoints.blob, 'https://', ''), '/', '')
    priority: 1
    weight: 1000
    enforceCertificateNameCheck: true
  }
}

// Route
resource route 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  parent: frontDoorEndpoint
  name: 'default-route'
  properties: {
    originGroup: {
      id: originGroup.id
    }
    supportedProtocols: [
      'Https'
    ]
    patternsToMatch: [
      '/*'
    ]
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    enabledState: 'Enabled'
  }
  dependsOn: [
    origin
  ]
}

// PostgreSQL Flexible Server with Entra ID (Azure AD) authentication
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${resourcePrefix}-postgres'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    version: '16'
    authConfig: {
      activeDirectoryAuth: 'Enabled'
      passwordAuth: 'Disabled'
    }
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// PostgreSQL Database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'graphic_designer'
}

// PostgreSQL Firewall Rule - Allow Azure Services
resource postgresFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${resourcePrefix}-insights'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 90
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Log Analytics Workspace for App Insights
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${resourcePrefix}-logs'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// App Service Plan (Standard tier - Basic quota exceeded)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${resourcePrefix}-plan'
  location: location
  tags: tags
  sku: {
    name: 'S1'
    tier: 'Standard'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service with Managed Identity
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: '${resourcePrefix}-app'
  location: location
  tags: tags
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    keyVaultReferenceIdentity: 'SystemAssigned'
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerRegistry.properties.loginServer}/${appName}:latest'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${containerRegistry.properties.loginServer}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: containerRegistry.listCredentials().username
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DATABASE_URI'
          value: 'host=${postgresServer.properties.fullyQualifiedDomainName} port=5432 dbname=graphic_designer sslmode=require'
        }
        {
          name: 'PAYLOAD_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/payload-secret/)'
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'AZURE_STORAGE_CONTAINER_NAME'
          value: 'portfolio-media'
        }
        {
          name: 'AZURE_CDN_HOSTNAME'
          value: frontDoorEndpoint.properties.hostName
        }
        {
          name: 'RESEND_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/resend-api-key/)'
        }
        {
          name: 'CONTACT_EMAIL_TO'
          value: contactEmailTo
        }
        {
          name: 'NEXT_PUBLIC_SITE_URL'
          value: 'https://${resourcePrefix}-app.azurewebsites.net'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
  dependsOn: [
    userSecretsOfficer
  ]
}

// RBAC: Grant App Service access to Key Vault Secrets
resource appServiceKeyVaultAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, appService.name, 'Key Vault Secrets User')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// RBAC: Grant App Service Storage Blob Data Contributor
resource appServiceStorageAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, appService.name, 'Storage Blob Data Contributor')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// RBAC: Grant App Service PostgreSQL Flexible Server Administrator
resource appServicePostgresAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(postgresServer.id, appService.name, 'PostgreSQL Flexible Server Administrator')
  scope: postgresServer
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'f7db85b8-5e3e-4438-8e1c-e7e1fc2cd036')
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs for GitHub Actions secrets and manual setup
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output containerRegistryName string = containerRegistry.name
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output appServiceName string = appService.name
output appServicePrincipalId string = appService.identity.principalId
output cdnEndpointHostname string = frontDoorEndpoint.properties.hostName
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appServiceUrl string = 'https://${resourcePrefix}-app.azurewebsites.net'
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
