
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

// Schema for email-only form
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type MagicLinkFormValues = z.infer<typeof emailSchema>;

interface MagicLinkFormProps {
  onSubmit: (values: MagicLinkFormValues) => void;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
}

const MagicLinkForm = ({
  onSubmit,
  loading,
  submitLabel,
  loadingLabel,
}: MagicLinkFormProps) => {
  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
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

export default MagicLinkForm;
