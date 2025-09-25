import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.'),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .max(100, 'First name should be shorter than 100 characters.')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    lastName: z
      .string()
      .max(100, 'Last name should be shorter than 100 characters.')
      .optional()
      .or(z.literal('').transform(() => undefined))
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address.')
});

export type PasswordResetRequestSchema = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export type PasswordResetConfirmSchema = z.infer<typeof passwordResetConfirmSchema>;
