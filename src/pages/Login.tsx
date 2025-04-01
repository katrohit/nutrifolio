
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneInput } from '@/components/ui/phone-input';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const { signInWithMagicLink, signIn, signInWithGoogle, signInWithOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleMagicLinkSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      setLoading(true);
      await signInWithMagicLink(values.email);
      setMagicLinkSent(true);
      setLoading(false);
      toast({
        title: 'Magic link sent',
        description: 'Check your email for a login link',
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send magic link',
        variant: 'destructive',
      });
    }
  };

  const handleOTPSubmit = async (values: z.infer<typeof phoneSchema>) => {
    try {
      setLoading(true);
      await signInWithOTP(values.phone);
      setOtpSent(true);
      setLoading(false);
      toast({
        title: 'OTP sent',
        description: 'Check your phone for a verification code',
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setLoading(true);
      await signIn(values.email, values.password);
      setLoading(false);
      navigate('/dashboard');
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // No need to navigate, the OAuth redirect will handle that
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/40 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-2 flex justify-center">
          <div className="rounded-full bg-primary p-2 text-primary-foreground">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM9 17H6C5.45 17 5 16.55 5 16V12C5 11.45 5.45 11 6 11H9C9.55 11 10 11.45 10 12V16C10 16.55 9.55 17 9 17ZM13.83 17H12.33C11.78 17 11.33 16.55 11.33 16V8C11.33 7.45 11.78 7 12.33 7H13.83C14.38 7 14.83 7.45 14.83 8V16C14.83 16.55 14.38 17 13.83 17ZM19 17H16.5C15.95 17 15.5 16.55 15.5 16V10C15.5 9.45 15.95 9 16.5 9H19C19.55 9 20 9.45 20 10V16C20 16.55 19.55 17 19 17Z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 text-gray-900">
          Sign in to NutriFolio
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {magicLinkSent ? (
            <div className="text-center">
              <div className="mb-4 text-6xl">✉️</div>
              <h3 className="mb-2 text-xl font-bold">Check your email</h3>
              <p className="text-muted-foreground">
                We've sent a magic link to your email address. Click the link to sign in.
              </p>
            </div>
          ) : otpSent ? (
            <div className="text-center">
              <div className="mb-4 text-6xl">📱</div>
              <h3 className="mb-2 text-xl font-bold">Check your phone</h3>
              <p className="text-muted-foreground">
                We've sent a verification code to your phone. Enter the code to sign in.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="magic-link" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                <TabsTrigger value="otp">Phone OTP</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="magic-link">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleMagicLinkSubmit)} className="space-y-6 pt-4">
                    <FormField
                      control={emailForm.control}
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
                        {loading ? 'Sending link...' : 'Send magic link'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="otp">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(handleOTPSubmit)} className="space-y-6 pt-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 555 123 4567" 
                              type="tel" 
                              autoComplete="tel" 
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
                        {loading ? 'Sending OTP...' : 'Send verification code'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="password">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6 pt-4">
                    <FormField
                      control={passwordForm.control}
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
                      control={passwordForm.control}
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
                        {loading ? 'Signing in...' : 'Sign in with password'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Google
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold leading-6 text-primary hover:text-primary/80">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
