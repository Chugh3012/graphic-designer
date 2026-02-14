import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch to discuss your next branding or packaging design project.',
}

export default function ContactPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl mb-6">Let&apos;s Work Together</h1>
            <p className="text-stone text-lg mb-8 leading-relaxed">
              Have a project in mind? I&apos;d love to hear about it. Fill out the form and I&apos;ll get back to you within 48 hours.
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
