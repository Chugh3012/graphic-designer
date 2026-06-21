import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    // In production this points at the mounted Azure Files volume (set via env);
    // locally it's a relative ./media directory.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
