import { z } from 'zod'

// Password validation: 12+ chars, uppercase, lowercase, number, symbol
export const passwordSchema = z
  .string()
  .min(12, 'Wachtwoord moet minimaal 12 tekens bevatten')
  .regex(/[A-Z]/, 'Wachtwoord moet een hoofdletter bevatten')
  .regex(/[a-z]/, 'Wachtwoord moet een kleine letter bevatten')
  .regex(/[0-9]/, 'Wachtwoord moet een cijfer bevatten')
  .regex(/[^A-Za-z0-9]/, 'Wachtwoord moet een speciaal teken bevatten')

export const registerSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 tekens bevatten'),
  email: z.string().email('Ongeldig e-mailadres'),
  password: passwordSchema,
  phone: z.string().optional(),
  phoneConsent: z.boolean(),
})

export const loginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
})

export const reservationSchema = z
  .object({
    resourceId: z.string().min(1, 'Resource is verplicht'),
    startTime: z.string().datetime({ message: 'Ongeldige starttijd' }),
    endTime: z.string().datetime({ message: 'Ongeldige eindtijd' }),
    purpose: z.enum(['TRAINING', 'LESSON', 'OTHER'], {
      error: 'Selecteer een doel',
    }),
    notes: z.string().max(500, 'Notities mogen maximaal 500 tekens bevatten').optional(),
    acknowledgeOverlap: z.boolean().optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Eindtijd moet na starttijd liggen',
    path: ['endTime'],
  })

export const blockSchema = z
  .object({
    resourceId: z.string().min(1, 'Resource is verplicht'),
    reason: z.string().min(1, 'Reden is verplicht'),
    startTime: z.string().datetime({ message: 'Ongeldige starttijd' }),
    endTime: z.string().datetime({ message: 'Ongeldige eindtijd' }),
    isRecurring: z.boolean().default(false),
    recurrenceRule: z.string().optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Eindtijd moet na starttijd liggen',
    path: ['endTime'],
  })

export const eventSchema = z
  .object({
    title: z.string().min(1, 'Titel is verplicht'),
    description: z.string().optional(),
    startTime: z.string().datetime({ message: 'Ongeldige starttijd' }),
    endTime: z.string().datetime({ message: 'Ongeldige eindtijd' }),
    visibility: z.enum(['PUBLIC', 'MEMBERS', 'ADMIN']).default('PUBLIC'),
    resourceIds: z.array(z.string()).optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'Eindtijd moet na starttijd liggen',
    path: ['endTime'],
  })

export const contactSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 tekens bevatten'),
  email: z.string().email('Ongeldig e-mailadres'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Onderwerp moet minimaal 2 tekens bevatten'),
  message: z.string().min(10, 'Bericht moet minimaal 10 tekens bevatten'),
  honeypot: z.string().max(0).optional(), // Spam protection
})

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
})

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Token is verplicht'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type BlockInput = z.infer<typeof blockSchema>
export type EventInput = z.infer<typeof eventSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
