import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Projects } from '@/collections/Projects'
import { ProjectCategories } from '@/collections/ProjectCategories'
import { Media } from '@/collections/Media'
import { Users } from '@/collections/Users'

import { SiteSettings } from '@/globals/SiteSettings'
import { Navigation } from '@/globals/Navigation'
import { Footer } from '@/globals/Footer'
import { HomePage } from '@/globals/HomePage'

import { migrations } from './migrations'

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

  // Restrict the API and auth cookies to our own origin, and disable the GraphQL
  // playground in production — minimise the public attack surface.
  cors: process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : [],
  csrf: process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : [],
  graphQL: {
    disablePlaygroundInProduction: true,
  },

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: sqliteAdapter({
    client: {
      // libSQL URL. Local dev defaults to a file in ./data; production points
      // at the SQLite file on the mounted Azure Files volume (set via env).
      url: process.env.DATABASE_URI || 'file:./data/portfolio.db',
    },
    // Dev: `push` auto-syncs the schema on save. Production: `push` is ignored
    // by Payload, so the committed migrations are run automatically on boot via
    // `prodMigrations` (single replica / single writer, so no migration race).
    // The migrations array is statically imported, so it survives the Next
    // standalone bundle where the migrationDir files are not copied.
    // ponytail: a destructive schema change still needs a hand-written migration;
    // generate it with `payload migrate:create` in dev.
    push: true,
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
    // WAL mode is required by Litestream (prod runs the DB on local disk and
    // streams it to Azure Blob). busyTimeout rides over brief lock contention
    // while Litestream checkpoints.
    wal: true,
    busyTimeout: 5000,
  }),

  sharp,
})
