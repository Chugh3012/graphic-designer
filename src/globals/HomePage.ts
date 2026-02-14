import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroHeading',
      type: 'text',
      label: 'Hero Heading',
    },
    {
      name: 'heroSubheading',
      type: 'text',
      label: 'Hero Subheading',
    },
    {
      name: 'featuredProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      label: 'Featured Projects',
    },
    {
      name: 'ctaHeading',
      type: 'text',
      label: 'CTA Heading',
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Text',
    },
    {
      name: 'ctaButtonText',
      type: 'text',
      label: 'CTA Button Text',
    },
    {
      name: 'ctaButtonLink',
      type: 'text',
      label: 'CTA Button Link',
    },
  ],
}
