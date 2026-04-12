'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import api from '@/lib/api';
import EmailVerification from '@/components/EmailVerification';
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    verifySession().then(({ isAuthenticated }) => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    });
  }, [router]);

  const passwordValidation = useMemo(() => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const strength = useMemo(() => {
    const passed = Object.values(passwordValidation).filter(Boolean).length;
    if (passed <= 1) return 'Weak';
    if (passed <= 3) return 'Fair';
    if (passed <= 4) return 'Good';
    return 'Strong';
  }, [passwordValidation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setShowVerification(true);
  };

  const handleEmailVerified = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
      setShowVerification(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
    window.location.href = `${backendUrl}/api/auth/google`;
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

  if (showVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4 py-10">
        <Card className="w-full max-w-lg border-[#e6e8ea] shadow-[0_18px_34px_rgba(0,72,115,0.12)]">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Verify your email</CardTitle>
            <CardDescription>
              Complete verification to finish account creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailVerification
              email={email}
              onVerified={handleEmailVerified}
              onCancel={() => setShowVerification(false)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f9fb] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,96,152,0.16),_transparent_50%)]" />
      <Card className="relative z-10 w-full max-w-lg border-[#e6e8ea] shadow-[0_18px_34px_rgba(0,72,115,0.12)]">
        <CardHeader className="space-y-2">
          <Badge variant="secondary" className="w-fit font-semibold">Create Account</Badge>
          <CardTitle className="text-3xl font-black tracking-tight">Join the DFN network</CardTitle>
          <CardDescription>
            Create your account to access projects, providers, and collaboration spaces.
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
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create password"
                required
              />

              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <p className="mb-1 font-medium">Strength: {strength}</p>
                <p>{passwordValidation.minLength ? '✓' : '○'} At least 6 characters</p>
                <p>{passwordValidation.hasUpperCase ? '✓' : '○'} Uppercase letter</p>
                <p>{passwordValidation.hasLowerCase ? '✓' : '○'} Lowercase letter</p>
                <p>{passwordValidation.hasNumber ? '✓' : '○'} Number</p>
                <p>{passwordValidation.hasSpecialChar ? '✓' : '○'} Special character</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Continue to verification'}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignup}>
              Sign up with Google
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/login" className="font-medium text-[#006098] hover:underline">
              Sign in instead
            </Link>
            <Link href="/" className="text-muted-foreground hover:underline">
              Back home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
