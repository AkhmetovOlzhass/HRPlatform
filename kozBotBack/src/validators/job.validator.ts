import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2),
  salary: z.object({
    from: z.number().min(1),
    to: z.number().min(1),
    currency: z.string().default("KZT"),
    type: z.string().default("netto")
  }),
  schedule: z.array(z.string()).optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  workTime: z.object({
    schedule: z.string().optional(),
    shiftStart: z.string().optional(),
    shiftEnd: z.string().optional()
  }).optional(),
  address: z.string().optional(),
  contacts: z.object({
    instagram: z.array(z.string()).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  source: z.string().optional(),
  isActive: z.boolean().optional()
});
