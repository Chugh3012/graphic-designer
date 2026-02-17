'use server'

import { EmailClient } from '@azure/communication-email'
import { contactFormSchema, type ContactFormData } from './validations'

export async function submitContactForm(
  data: ContactFormData,
): Promise<{ success: boolean; message: string }> {
  // Validate with Zod
  const result = contactFormSchema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid form data'
    return { success: false, message: firstError }
  }

  const validated = result.data

  // Check honeypot field
  if (validated.website.length > 0) {
    // Silently reject but return success to not tip off bots
    return { success: true, message: 'Thank you for your message!' }
  }

  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING
  const emailFrom = process.env.EMAIL_FROM
  const contactEmail = process.env.CONTACT_EMAIL_TO

  if (!connectionString || !emailFrom || !contactEmail) {
    console.error('Email configuration missing')
    return { success: false, message: 'Server configuration error. Please try again later.' }
  }

  try {
    const emailClient = new EmailClient(connectionString)

    const emailMessage = {
      senderAddress: emailFrom,
      content: {
        subject: `New contact form submission from ${validated.name}`,
        plainText: [
          `Name: ${validated.name}`,
          `Email: ${validated.email}`,
          `Project Type: ${validated.projectType}`,
          `Budget Range: ${validated.budgetRange}`,
          '',
          'Message:',
          validated.message,
        ].join('\n'),
      },
      recipients: {
        to: [{ address: contactEmail }],
      },
      replyTo: [{ address: validated.email }],
    }

    const poller = await emailClient.beginSend(emailMessage)
    await poller.pollUntilDone()

    return { success: true, message: 'Thank you for your message! I will get back to you soon.' }
  } catch (error) {
    console.error('Failed to send contact form email:', error)
    return { success: false, message: 'Failed to send message. Please try again later.' }
  }
}
