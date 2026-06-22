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

  db: sqliteAdapter({
    client: {
      // libSQL URL. Local dev defaults to a file in ./data; production points
      // at the SQLite file on the mounted Azure Files volume (set via env).
      url: process.env.DATABASE_URI || 'file:./data/portfolio.db',
    },
    // Single-instance SQLite portfolio: auto-sync the schema on boot. The DB
    // file lives on a mounted volume only reachable from inside the container,
    // so a separate `payload migrate` step isn't practical; push keeps the
    // (single-writer) schema in step with the config. Migrations are still
    // committed for reference.
    // ponytail: push can drop columns on a destructive change. For a risky
    // schema change, run `payload migrate` against the volume instead.
    push: true,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  sharp,
})
