import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  projectType: z.string().min(1, 'Please select a project type'),
  budgetRange: z.string().min(1, 'Please select a budget range'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  website: z.string().max(0, 'Bot detected'), // honeypot
})

export type ContactFormData = z.infer<typeof contactFormSchema>
