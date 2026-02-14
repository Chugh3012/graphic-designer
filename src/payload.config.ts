import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { azureStorage } from '@payloadcms/storage-azure'
import sharp from 'sharp'

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
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  sharp,

  plugins: [
    ...(process.env.AZURE_STORAGE_CONNECTION_STRING
      ? [
          azureStorage({
            collections: {
              media: true,
            },
            allowContainerCreate: true,
            baseURL: `https://${process.env.AZURE_CDN_HOSTNAME || 'localhost'}/${process.env.AZURE_STORAGE_CONTAINER_NAME || 'media'}`,
            connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
            containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'media',
          }),
        ]
      : []),
  ],
})
