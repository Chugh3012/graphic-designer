// Azure Infrastructure as Code for Graphic Designer Portfolio
// Deploy to West Europe region

@description('Environment name (e.g., production, staging)')
param environmentName string = 'production'

@description('Azure region for all resources')
param location string = 'westeurope'

@description('Application name (used for resource naming)')
param appName string = 'graphic-designer'

@description('PostgreSQL administrator password')
@secure()
param postgresPassword string

@description('Payload CMS secret key')
@secure()
param payloadSecret string

@description('Resend API key for email')
@secure()
param resendApiKey string

@description('Contact email recipient')
param contactEmailTo string

var resourcePrefix = '${appName}-${environmentName}'
var tags = {
  environment: environmentName
  application: appName
  managedBy: 'bicep'
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: replace('${resourcePrefix}acr', '-', '')
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// Storage Account for media/images
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: replace('${resourcePrefix}storage', '-', '')
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
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

// CDN Profile
resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: '${resourcePrefix}-cdn'
  location: 'Global'
  tags: tags
  sku: {
    name: 'Standard_Microsoft'
  }
}

// CDN Endpoint for blob storage
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2023-05-01' = {
  parent: cdnProfile
  name: '${resourcePrefix}-media'
  location: 'Global'
  tags: tags
  properties: {
    originHostHeader: storageAccount.properties.primaryEndpoints.blob
    isHttpAllowed: false
    isHttpsAllowed: true
    queryStringCachingBehavior: 'IgnoreQueryString'
    contentTypesToCompress: [
      'image/jpeg'
      'image/png'
      'image/webp'
      'image/svg+xml'
    ]
    isCompressionEnabled: true
    origins: [
      {
        name: 'blob-origin'
        properties: {
          hostName: replace(replace(storageAccount.properties.primaryEndpoints.blob, 'https://', ''), '/', '')
          httpPort: 80
          httpsPort: 443
          originHostHeader: replace(replace(storageAccount.properties.primaryEndpoints.blob, 'https://', ''), '/', '')
        }
      }
    ]
    deliveryPolicy: {
      rules: [
        {
          name: 'CacheImages'
          order: 1
          conditions: [
            {
              name: 'UrlFileExtension'
              parameters: {
                typeName: 'DeliveryRuleUrlFileExtensionMatchConditionParameters'
                operator: 'Equal'
                matchValues: [
                  'jpg'
                  'jpeg'
                  'png'
                  'webp'
                  'gif'
                  'svg'
                ]
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                typeName: 'DeliveryRuleCacheExpirationActionParameters'
                cacheBehavior: 'SetIfMissing'
                cacheType: 'All'
                cacheDuration: '7.00:00:00' // 7 days
              }
            }
          ]
        }
      ]
    }
  }
}

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
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
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
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

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${resourcePrefix}-plan'
  location: location
  tags: tags
  sku: {
    name: 'B2'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: '${resourcePrefix}-app'
  location: location
  tags: tags
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
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
          value: 'postgresql://payloadadmin:${postgresPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/graphic_designer?sslmode=require'
        }
        {
          name: 'PAYLOAD_SECRET'
          value: payloadSecret
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
          value: cdnEndpoint.properties.hostName
        }
        {
          name: 'RESEND_API_KEY'
          value: resendApiKey
        }
        {
          name: 'CONTACT_EMAIL_TO'
          value: contactEmailTo
        }
        {
          name: 'NEXT_PUBLIC_SITE_URL'
          value: 'https://${appService.properties.defaultHostName}'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
}

// Outputs for GitHub Actions secrets
output containerRegistryName string = containerRegistry.name
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output appServiceName string = appService.name
output cdnEndpointHostname string = cdnEndpoint.properties.hostName
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
