'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import api from '@/lib/api';
import { verifySession } from '@/lib/auth';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
} from '@/components/ui';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/';
  const isAdminRedirect = redirectTo === '/admin';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    verifySession().then(({ isAuthenticated }) => {
      if (isAuthenticated) {
        router.push(redirectTo);
      } else {
        setIsCheckingAuth(false);
      }
    });
  }, [router, redirectTo]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Dispatch custom event to notify other components of successful login
      window.dispatchEvent(new CustomEvent('auth-token-set', { detail: { token: response.data.token } }));
      
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
    // Pass redirect_to for OAuth callback
    window.location.href = `${backendUrl}/api/auth/google?redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb]">
        <div className="text-center">
          <div className="mx-auto size-11 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f9fb] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,96,152,0.14),_transparent_45%)]" />
      <Card className="relative z-10 w-full max-w-md border-[#e6e8ea] shadow-[0_18px_34px_rgba(0,72,115,0.12)]">
        <CardHeader className="space-y-2">
          <Badge variant="secondary" className="w-fit font-semibold">Account Access</Badge>
          <CardTitle className="text-3xl font-black tracking-tight">
            {isAdminRedirect ? 'Admin Access' : 'Sign in'}
          </CardTitle>
          <CardDescription>
            {isAdminRedirect 
              ? 'Enter your admin credentials to access the platform dashboard.'
              : 'Access your fabrication workspace, projects, and marketplace operations.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="mt-1" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in to DFN'}
            </Button>
          </form>

          {!isAdminRedirect && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                Continue with Google
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            {!isAdminRedirect && (
              <Link href="/auth/register" className="font-medium text-[#006098] hover:underline">
                Create account
              </Link>
            )}
            {isAdminRedirect && (
              <span className="text-muted-foreground text-xs">Admin credentials required</span>
            )}
            <Link href="/" className="text-muted-foreground hover:underline">
              Back home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb]">
        <div className="text-center">
          <div className="mx-auto size-11 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
