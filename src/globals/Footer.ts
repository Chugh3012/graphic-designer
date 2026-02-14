import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'copyright',
      type: 'text',
    },
  ],
}
