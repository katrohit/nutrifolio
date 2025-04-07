
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import EmailPasswordForm, { EmailPasswordFormValues } from '@/components/auth/EmailPasswordForm';
import MagicLinkForm, { MagicLinkFormValues } from '@/components/auth/MagicLinkForm';
import GoogleButton from '@/components/auth/GoogleButton';
import AuthDivider from '@/components/auth/AuthDivider';
import AuthLogo from '@/components/auth/AuthLogo';
import EmailSentCard from '@/components/auth/EmailSentCard';

const LoginPage = () => {
  const { signInWithMagicLink, signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleAuthError = () => {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (error) {
        setAuthError(errorDescription || error);
        toast({
          title: 'Authentication Error',
          description: errorDescription || error,
          variant: 'destructive',
        });
        
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, url.toString());
      }
    };
    
    handleAuthError();
  }, [toast]);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log('Auth check on login page:', { data, error });
    };
    
    checkAuthStatus();
  }, []);

  const handleMagicLinkSubmit = async (values: MagicLinkFormValues) => {
    try {
      setLoading(true);
      setAuthError(null);
      await signInWithMagicLink(values.email);
      setMagicLinkSent(true);
      setLoading(false);
      toast({
        title: 'Magic link sent',
        description: 'Check your email for a login link',
      });
    } catch (error: any) {
      setLoading(false);
      setAuthError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send magic link',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordSubmit = async (values: EmailPasswordFormValues) => {
    try {
      setLoading(true);
      setAuthError(null);
      await signIn(values.email, values.password);
      setLoading(false);
      navigate('/dashboard');
    } catch (error: any) {
      setLoading(false);
      setAuthError(error.message);
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
      setAuthError(null);
      await signInWithGoogle();
      // No need to navigate, the OAuth redirect will handle that
    } catch (error: any) {
      setLoading(false);
      setAuthError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    }
  };

  const renderAuthError = () => {
    if (!authError) return null;
    
    return (
      <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
        <p className="font-medium">Authentication Error</p>
        <p>{authError}</p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-muted/40 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AuthLogo />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 text-gray-900">
          Sign in to NutriFolio
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {renderAuthError()}
          
          {magicLinkSent ? (
            <EmailSentCard 
              title="Check your email" 
              description="We've sent a magic link to your email address. Click the link to sign in."
            />
          ) : (
            <Tabs defaultValue="magic-link" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="magic-link">
                <MagicLinkForm
                  onSubmit={handleMagicLinkSubmit}
                  loading={loading}
                  submitLabel="Send magic link"
                  loadingLabel="Sending link..."
                />
              </TabsContent>
              
              <TabsContent value="password">
                <EmailPasswordForm
                  onSubmit={handlePasswordSubmit}
                  loading={loading}
                  submitLabel="Sign in with password"
                  loadingLabel="Signing in..."
                />
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-6">
            <AuthDivider />
            <div className="mt-6">
              <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />
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
