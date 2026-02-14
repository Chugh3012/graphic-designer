'use server'

import { Resend } from 'resend'
import { contactFormSchema, type ContactFormData } from './validations'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(
  data: ContactFormData,
): Promise<{ success: boolean; message: string }> {
  // Validate with Zod
  const result = contactFormSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? 'Invalid form data'
    return { success: false, message: firstError }
  }

  const validated = result.data

  // Check honeypot field
  if (validated.website.length > 0) {
    // Silently reject but return success to not tip off bots
    return { success: true, message: 'Thank you for your message!' }
  }

  const contactEmail = process.env.CONTACT_EMAIL_TO
  if (!contactEmail) {
    console.error('CONTACT_EMAIL_TO environment variable is not set')
    return { success: false, message: 'Server configuration error. Please try again later.' }
  }

  try {
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: contactEmail,
      subject: `New contact form submission from ${validated.name}`,
      replyTo: validated.email,
      text: [
        `Name: ${validated.name}`,
        `Email: ${validated.email}`,
        `Project Type: ${validated.projectType}`,
        `Budget Range: ${validated.budgetRange}`,
        '',
        'Message:',
        validated.message,
      ].join('\n'),
    })

    return { success: true, message: 'Thank you for your message! I will get back to you soon.' }
  } catch (error) {
    console.error('Failed to send contact form email:', error)
    return { success: false, message: 'Failed to send message. Please try again later.' }
  }
}
