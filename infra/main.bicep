// ─────────────────────────────────────────────────────────────────────────────
// Graphic Designer Portfolio — Azure infrastructure (single source of truth)
//
// Static Web Apps (Free) — the whole topology. $0/month.
//   • Hosts the hybrid Next.js site (static pages + a managed backend for the
//     contact server action and the Keystatic admin API routes).
//   • No database, no storage account, no Key Vault, no Container Apps.
//     Content + images live in the git repo (Keystatic, git-based CMS).
//
// Deployment is token-based (Azure/static-web-apps-deploy in CI), so this file
// only declares the resource. Oryx builds the app with `npm install`, sidestepping
// the cross-platform lockfile strictness of `npm ci`.
//
// ponytail: contact-form email needs an ACS connection string at request time.
// Free SWA has no managed identity, so that one value lives in the SWA app
// settings (set out-of-band, never in the repo). Upgrade path if passwordless is
// required: move to the Standard plan + a user-assigned identity, or send mail
// from a tiny Function App with MI.
// ─────────────────────────────────────────────────────────────────────────────

@description('Static Web App name.')
param appName string = 'graphic-designer'

@description('Static Web Apps Free tier region. Allowed: westus2, centralus, eastus2, westeurope, eastasia.')
@allowed([
  'westus2'
  'centralus'
  'eastus2'
  'westeurope'
  'eastasia'
])
param location string = 'westeurope'

resource swa 'Microsoft.Web/staticSites@2024-04-01' = {
  name: appName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // CI owns the workflow + deploys via the API token; don't let Azure generate one.
    allowConfigFileUpdates: true
  }
  tags: {
    application: appName
    managedBy: 'bicep'
  }
}

output staticWebAppName string = swa.name
output defaultHostname string = swa.properties.defaultHostname
