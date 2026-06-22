import { config, fields, collection, singleton } from '@keystatic/core'

// Git-based CMS. Content lives as files in this repo (no database, no server).
// Local mode for dev; switch `storage` to GitHub mode for the hosted admin.
// Images are co-located under public/ so they're served directly by the CDN.

const projectImageDir = 'public/images/projects'
const projectImagePublic = '/images/projects'

export default config({
  storage: { kind: 'local' },

  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'content/projects/*',
      columns: ['title', 'client', 'year'],
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Published', value: 'published' },
            { label: 'Draft', value: 'draft' },
          ],
          defaultValue: 'published',
        }),
        featured: fields.checkbox({ label: 'Featured on home page', defaultValue: false }),
        sortOrder: fields.integer({ label: 'Sort order', defaultValue: 0 }),
        heroImage: fields.image({
          label: 'Hero image',
          directory: projectImageDir,
          publicPath: projectImagePublic,
          validation: { isRequired: true },
        }),
        categories: fields.array(
          fields.relationship({ label: 'Category', collection: 'categories' }),
          { label: 'Categories', itemLabel: (props) => props.value ?? 'Category' },
        ),
        company: fields.text({ label: 'Agency / Company' }),
        client: fields.text({ label: 'Client / Brand' }),
        year: fields.integer({ label: 'Year' }),
        services: fields.array(fields.text({ label: 'Service' }), {
          label: 'Services',
          itemLabel: (props) => props.value || 'Service',
        }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        brief: fields.text({ label: 'Project brief', multiline: true }),
        concept: fields.text({ label: 'Concept / approach', multiline: true }),
        keyConsiderations: fields.array(fields.text({ label: 'Consideration' }), {
          label: 'Key considerations',
          itemLabel: (props) => props.value || 'Consideration',
        }),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: 'Image',
              directory: projectImageDir,
              publicPath: projectImagePublic,
              validation: { isRequired: true },
            }),
            caption: fields.text({ label: 'Caption' }),
          }),
          { label: 'Gallery', itemLabel: (props) => props.fields.caption.value || 'Image' },
        ),
        seo: fields.object(
          {
            metaTitle: fields.text({ label: 'Meta title' }),
            metaDescription: fields.text({ label: 'Meta description', multiline: true }),
          },
          { label: 'SEO' },
        ),
      },
    }),

    categories: collection({
      label: 'Categories',
      slugField: 'name',
      path: 'content/categories/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
      },
    }),
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site settings',
      path: 'content/settings/site',
      format: { data: 'json' },
      schema: {
        siteTitle: fields.text({ label: 'Site title' }),
        tagline: fields.text({ label: 'Tagline' }),
        instagram: fields.url({ label: 'Instagram URL' }),
        behance: fields.url({ label: 'Behance URL' }),
        linkedin: fields.url({ label: 'LinkedIn URL' }),
        dribbble: fields.url({ label: 'Dribbble URL' }),
        email: fields.text({ label: 'Contact email' }),
      },
    }),

    homePage: singleton({
      label: 'Home page',
      path: 'content/settings/home',
      format: { data: 'json' },
      schema: {
        heroHeading: fields.text({ label: 'Hero heading' }),
        heroSubheading: fields.text({ label: 'Hero subheading', multiline: true }),
        ctaHeading: fields.text({ label: 'CTA heading' }),
        ctaText: fields.text({ label: 'CTA text', multiline: true }),
        ctaButtonText: fields.text({ label: 'CTA button text' }),
        ctaButtonLink: fields.text({ label: 'CTA button link' }),
      },
    }),

    about: singleton({
      label: 'About page',
      path: 'content/settings/about',
      format: { contentField: 'body' },
      schema: {
        heading: fields.text({ label: 'Heading' }),
        intro: fields.text({ label: 'Intro', multiline: true }),
        body: fields.markdoc({ label: 'Body' }),
      },
    }),
  },
})
