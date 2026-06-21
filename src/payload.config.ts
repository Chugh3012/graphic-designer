import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { azureStorage } from '@payloadcms/storage-azure'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import sharp from 'sharp'

import { azureBlobManagedIdentity } from '@/lib/azure-blob-mi'

import { Projects } from '@/collections/Projects'
import { ProjectCategories } from '@/collections/ProjectCategories'
import { Media } from '@/collections/Media'
import { Users } from '@/collections/Users'

import { SiteSettings } from '@/globals/SiteSettings'
import { Navigation } from '@/globals/Navigation'
import { Footer } from '@/globals/Footer'
import { HomePage } from '@/globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ── Passwordless Postgres (Microsoft Entra) ──────────────────────────────────
// When AZURE_POSTGRES_HOST is set (production on Azure), authenticate with a
// Microsoft Entra access token fetched via the container's managed identity —
// no password. The token is requested per new pool connection, so it refreshes
// automatically. Locally (host unset) we use the DATABASE_URI connection string.
const entraDbHost = process.env.AZURE_POSTGRES_HOST
const dbPool = entraDbHost
  ? {
      host: entraDbHost,
      port: 5432,
      user: process.env.AZURE_POSTGRES_USER, // the managed identity's name
      database: process.env.AZURE_POSTGRES_DB || 'graphic_designer',
      ssl: { rejectUnauthorized: true },
      password: async (): Promise<string> => {
        const { DefaultAzureCredential } = await import('@azure/identity')
        const token = await new DefaultAzureCredential().getToken(
          'https://ossrdbms-aad.database.windows.net/.default',
        )
        return token.token
      },
    }
  : { connectionString: process.env.DATABASE_URI || '' }

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Projects, ProjectCategories, Media, Users],

  globals: [SiteSettings, Navigation, Footer, HomePage],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: dbPool,
    // In production, schema changes must go through committed migrations
    // (`payload migrate`). Dev keeps auto-push for fast iteration.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  sharp,

  plugins: [
    // Media storage, in priority order:
    //   1. AZURE_STORAGE_ACCOUNT_NAME  -> Azure Blob via managed identity (passwordless)
    //   2. AZURE_STORAGE_CONNECTION_STRING -> Azure Blob via connection string (fallback)
    //   3. neither -> Payload's local filesystem (local development)
    ...(process.env.AZURE_STORAGE_ACCOUNT_NAME
      ? [
          cloudStoragePlugin({
            collections: {
              media: {
                adapter: azureBlobManagedIdentity({
                  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
                  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'portfolio-media',
                  baseURL: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.${
                    process.env.AZURE_STORAGE_SUFFIX || 'core.windows.net'
                  }`,
                }),
                disablePayloadAccessControl: true,
              },
            },
          }),
        ]
      : process.env.AZURE_STORAGE_CONNECTION_STRING
        ? [
            azureStorage({
              collections: {
                media: {
                  disablePayloadAccessControl: true,
                },
              },
              allowContainerCreate: false,
              baseURL: `https://${process.env.AZURE_CDN_HOSTNAME || 'localhost'}`,
              connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
              containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'media',
            }),
          ]
        : []),
  ],
})
