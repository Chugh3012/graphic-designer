import type { Block, CollectionConfig } from 'payload'

const formatSlug = (val: string): string =>
  val
    .trim()
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

/* ── Content Block definitions ────────────────────────────── */

const TextBlock: Block = {
  slug: 'textBlock',
  labels: { singular: 'Text Section', plural: 'Text Sections' },
  fields: [
    { name: 'heading', type: 'text', label: 'Section Heading' },
    { name: 'body', type: 'richText', label: 'Body Text' },
  ],
}

const ImageBlock: Block = {
  slug: 'imageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Medium', value: 'medium' },
        { label: 'Small', value: 'small' },
      ],
    },
  ],
}

const GalleryBlock: Block = {
  slug: 'galleryBlock',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'heading', type: 'text', label: 'Section Heading' },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
  ],
}

const BeforeAfterBlock: Block = {
  slug: 'beforeAfterBlock',
  labels: { singular: 'Before / After', plural: 'Before / After' },
  fields: [
    { name: 'heading', type: 'text', label: 'Section Heading' },
    { name: 'beforeImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'afterImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'beforeLabel', type: 'text', defaultValue: 'Before' },
    { name: 'afterLabel', type: 'text', defaultValue: 'After' },
  ],
}

/* ── Projects collection ──────────────────────────────────── */

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'company', 'client', 'categories', 'status', 'featured'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (typeof value === 'string' && value.length > 0) {
              return formatSlug(value)
            }
            if (typeof siblingData?.title === 'string' && siblingData.title.length > 0) {
              return formatSlug(siblingData.title)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'project-categories',
      hasMany: true,
    },
    {
      name: 'company',
      type: 'text',
      label: 'Agency / Company',
      admin: {
        description: 'The agency or company this project was done at (e.g. Landor, Dy works)',
      },
    },
    {
      name: 'client',
      type: 'text',
      label: 'Client / Brand',
      admin: {
        description: 'The brand or client this project was for (e.g. Gillette, Kellogg\'s)',
      },
    },
    {
      name: 'year',
      type: 'number',
    },
    {
      name: 'services',
      type: 'array',
      fields: [
        {
          name: 'service',
          type: 'text',
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: {
        description: 'Short summary for project cards and SEO.',
      },
    },
    // ── Brief section ──
    {
      name: 'brief',
      type: 'textarea',
      label: 'Project Brief',
      admin: {
        description: 'The design brief / objective for this project.',
      },
    },
    {
      name: 'keyConsiderations',
      type: 'array',
      label: 'Key Considerations',
      admin: {
        description: 'Numbered list of key considerations from the brief.',
      },
      fields: [
        {
          name: 'consideration',
          type: 'text',
          required: true,
        },
      ],
    },
    // ── Concept / Process ──
    {
      name: 'concept',
      type: 'textarea',
      label: 'Concept / Design Approach',
      admin: {
        description: 'The design concept or creative approach narrative.',
      },
    },
    // ── Flexible content blocks ──
    {
      name: 'contentBlocks',
      type: 'blocks',
      label: 'Content Sections',
      blocks: [TextBlock, ImageBlock, GalleryBlock, BeforeAfterBlock],
      admin: {
        description:
          'Build the project story using text, images, galleries, and before/after comparisons.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
        },
      ],
    },
  ],
}
