
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailPasswordForm, { EmailPasswordFormValues } from '@/components/auth/EmailPasswordForm';
import MagicLinkForm, { MagicLinkFormValues } from '@/components/auth/MagicLinkForm';
import GoogleButton from '@/components/auth/GoogleButton';
import AuthDivider from '@/components/auth/AuthDivider';
import AuthLogo from '@/components/auth/AuthLogo';
import EmailSentCard from '@/components/auth/EmailSentCard';

const RegisterPage = () => {
  const { signUp, signInWithMagicLink, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleEmailPasswordSubmit = async (values: EmailPasswordFormValues) => {
    try {
      setLoading(true);
      await signUp(values.email, values.password);
      setRegistered(true);
      setLoading(false);
      toast({
        title: 'Registration successful',
        description: 'Check your email for a confirmation link.',
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
    }
  };

  const handleMagicLinkSubmit = async (values: MagicLinkFormValues) => {
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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // No need to navigate here, the OAuth redirect will handle that
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
        <AuthLogo />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 text-gray-900">
          Create your NutriFolio account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {registered ? (
            <EmailSentCard 
              title="Check your email" 
              description="We've sent a confirmation link to your email address. Click the link to complete your registration."
            />
          ) : magicLinkSent ? (
            <EmailSentCard 
              title="Check your email" 
              description="We've sent a magic link to your email address. Click the link to sign in."
            />
          ) : (
            <>
              <Tabs defaultValue="email-password" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email-password">Email & Password</TabsTrigger>
                  <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email-password">
                  <EmailPasswordForm
                    onSubmit={handleEmailPasswordSubmit}
                    loading={loading}
                    submitLabel="Create account"
                    loadingLabel="Creating account..."
                  />
                </TabsContent>
                
                <TabsContent value="magic-link">
                  <MagicLinkForm
                    onSubmit={handleMagicLinkSubmit}
                    loading={loading}
                    submitLabel="Send magic link"
                    loadingLabel="Sending link..."
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <AuthDivider />
                <div className="mt-6">
                  <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold leading-6 text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
