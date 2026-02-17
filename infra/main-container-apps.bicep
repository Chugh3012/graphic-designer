// Azure Infrastructure - Container Apps Edition
// Serverless, cheaper, no quota limits

@description('Environment name')
param environmentName string = 'production'

@description('Azure region')
param location string = 'northeurope'

@description('Application name')
param appName string = 'graphic-designer'

@description('Contact email')
param contactEmailTo string

@description('Your Azure AD User Object ID')
param userObjectId string

@description('Resend API key')
@secure()
param resendApiKey string = ''

@description('Payload secret')
@secure()
param payloadSecret string = ''

var resourcePrefix = '${appName}-${environmentName}'
var uniqueSuffix = uniqueString(resourceGroup().id)
var keyVaultName = take('${appName}${environmentName}${uniqueSuffix}', 24)
var containerAppsEnvName = '${resourcePrefix}-env'
var tags = {
  environment: environmentName
  application: appName
  managedBy: 'bicep'
}

// Key Vault
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
    publicNetworkAccess: 'Enabled'
  }
}

// Grant user Key Vault Secrets Officer
resource userSecretsOfficer 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, userObjectId, 'secrets-officer')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
    principalId: userObjectId
    principalType: 'User'
  }
}

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
  }
}

// Storage Account
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
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'portfolio-media'
}

// Azure Front Door
resource frontDoorProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: '${resourcePrefix}-fd'
  location: 'Global'
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  parent: frontDoorProfile
  name: '${resourcePrefix}-media'
  location: 'Global'
  properties: {
    enabledState: 'Enabled'
  }
}

resource originGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
  parent: frontDoorProfile
  name: 'blob-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
  }
}

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
  }
}

resource route 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  parent: frontDoorEndpoint
  name: 'default-route'
  properties: {
    originGroup: {
      id: originGroup.id
    }
    supportedProtocols: ['Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
  }
  dependsOn: [origin]
}

// PostgreSQL with Entra ID
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
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'graphic_designer'
}

resource postgresFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
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
  }
}

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

// Azure Communication Services
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: '${resourcePrefix}-comms'
  location: 'global'
  tags: tags
  properties: {
    dataLocation: 'Europe'
  }
}

// Email Communication Service (requires domain verification)
resource emailService 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: '${resourcePrefix}-email'
  location: 'global'
  tags: tags
  properties: {
    dataLocation: 'Europe'
  }
}

// Azure Managed Domain for email (free tier: AzureManagedDomain)
resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
  }
}

// Container Apps Environment
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerAppsEnvName
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

// Container App
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${resourcePrefix}-app'
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppsEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'payload-secret'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/payload-secret'
          identity: 'system'
        }
        {
          name: 'storage-connection'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'communication-connection'
          value: communicationService.listKeys().primaryConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'graphic-designer'
          image: '${containerRegistry.properties.loginServer}/${appName}:latest'
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            {
              name: 'DATABASE_URI'
              value: 'host=${postgresServer.properties.fullyQualifiedDomainName} port=5432 dbname=graphic_designer sslmode=require'
            }
            {
              name: 'PAYLOAD_SECRET'
              secretRef: 'payload-secret'
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-connection'
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
              name: 'AZURE_COMMUNICATION_CONNECTION_STRING'
              secretRef: 'communication-connection'
            }
            {
              name: 'EMAIL_FROM'
              value: 'DoNotReply@${emailDomain.properties.fromSenderDomain}'
            }
            {
              name: 'CONTACT_EMAIL_TO'
              value: contactEmailTo
            }
            {
              name: 'NEXT_PUBLIC_SITE_URL'
              value: 'https://${resourcePrefix}-app.${containerAppsEnv.properties.defaultDomain}'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  dependsOn: [userSecretsOfficer]
}

// RBAC: Container App → Key Vault
resource containerAppKeyVaultAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, containerApp.name, 'kv-secrets')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// RBAC: Container App → Storage
resource containerAppStorageAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, containerApp.name, 'storage')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// RBAC: Container App → PostgreSQL
resource containerAppPostgresAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(postgresServer.id, containerApp.name, 'postgres')
  scope: postgresServer
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'f7db85b8-5e3e-4438-8e1c-e7e1fc2cd036')
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output keyVaultName string = keyVault.name
output keyVaultUri string = keyVault.properties.vaultUri
output containerRegistryName string = containerRegistry.name
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerAppName string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppUrl string = 'https://${resourcePrefix}-app.${containerAppsEnv.properties.defaultDomain}'
output cdnEndpointHostname string = frontDoorEndpoint.properties.hostName
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output communicationServiceName string = communicationService.name
output emailFromAddress string = 'DoNotReply@${emailDomain.properties.fromSenderDomain}'
