'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  confirmPasswordReset,
  requestPasswordReset
} from '@/lib/api/auth';
import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema
} from '@/lib/schemas/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export type PasswordResetFormMode = 'request' | 'confirm';

interface PasswordResetFormProps {
  mode?: PasswordResetFormMode;
  token?: string;
}

type FormValues = Record<string, string>;

export default function PasswordResetForm({ mode = 'request', token }: PasswordResetFormProps) {
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(mode === 'request' ? passwordResetRequestSchema : passwordResetConfirmSchema),
    defaultValues:
      mode === 'request'
        ? { email: '' }
        : { token: token ?? '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (values: FormValues) => {
    setInfo(null);
    setError(null);

    try {
      if (mode === 'request' && values.email) {
        await requestPasswordReset({ email: values.email });
        setInfo('If the email exists, a password reset link has been sent.');
        form.reset();
      }

      if (mode === 'confirm' && values.token && values.password) {
        await confirmPasswordReset({ token: values.token, password: values.password });
        setInfo('Password updated successfully. You can now log in.');
      }
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message ?? 'Request failed. Please try again.';
      setError(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {info && (
          <Alert className="border-green-500 text-green-900">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}
        {mode === 'request' ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset token</FormLabel>
                  <FormControl>
                    <Input placeholder="Paste your reset token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Strong password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Repeat new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Please wait…' : mode === 'request' ? 'Send reset link' : 'Reset password'}
        </Button>
      </form>
    </Form>
  );
}
