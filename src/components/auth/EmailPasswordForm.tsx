
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Schema for email & password form
const emailPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type EmailPasswordFormValues = z.infer<typeof emailPasswordSchema>;

interface EmailPasswordFormProps {
  onSubmit: (values: EmailPasswordFormValues) => void;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
}

const EmailPasswordForm = ({
  onSubmit,
  loading,
  submitLabel,
  loadingLabel,
}: EmailPasswordFormProps) => {
  const form = useForm<EmailPasswordFormValues>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your.email@example.com" 
                  type="email" 
                  autoComplete="email" 
                  disabled={loading} 
                  {...field} 
                />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  placeholder="••••••••" 
                  type="password" 
                  autoComplete="current-password" 
                  disabled={loading} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? loadingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmailPasswordForm;
