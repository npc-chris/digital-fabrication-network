'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import NotificationsDropdown from '@/components/NotificationsDropdown';
import UserDropdown from '@/components/UserDropdown';
import { verifySession } from '@/lib/auth';

type LandingNavUser = {
  id?: number;
  role?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  [key: string]: unknown;
};

type LandingNavbarProps = {
  active?: 'home' | 'research' | 'prototyping' | 'stakeholders' | null;
  fixed?: boolean;
};

const navLinks = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/forum', label: 'Research', key: 'research' },
  { href: '/prototyping', label: 'Prototyping', key: 'prototyping' },
  { href: '/stakeholders', label: 'Stakeholders', key: 'stakeholders' },
] as const;

export default function LandingNavbar({ active = null, fixed = true }: LandingNavbarProps) {
  const [user, setUser] = useState<LandingNavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await verifySession();
        if (result.isAuthenticated && result.user) {
          setUser(result.user as LandingNavUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    loadUser();

    const onAuthTokenSet = () => {
      loadUser();
    };

    const onAuthTokenCleared = () => {
      setUser(null);
    };

    window.addEventListener('auth-token-set', onAuthTokenSet);
    window.addEventListener('auth-token-cleared', onAuthTokenCleared);

    return () => {
      window.removeEventListener('auth-token-set', onAuthTokenSet);
      window.removeEventListener('auth-token-cleared', onAuthTokenCleared);
    };
  }, []);

  const containerClass = fixed
    ? 'nav-enter fixed top-0 z-50 w-full border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-xl'
    : 'w-full border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-xl';

  return (
    <header className={containerClass}>
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <Image
            src="/favicon.png"
            alt="DFN logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg ring-1 ring-slate-200"
          />
          <span className="hidden text-sm font-semibold text-slate-600 lg:inline">Digital Fabrication Network</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = active === link.key;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'text-sm transition-colors',
                  isActive
                    ? 'border-b-2 border-sky-700 pb-1 font-bold text-sky-700'
                    : 'font-medium text-slate-600 hover:text-sky-900',
                ].join(' ')}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          {user ? (
            <>
              {user.role === 'admin' || user.role === 'platform_manager' ? (
                <Link
                  href="/admin"
                  className="rounded-xl bg-[#f2f4f6] px-4 py-2 text-sm font-semibold text-[#004873] transition-colors hover:bg-[#e6e8ea]"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-[#f2f4f6] px-4 py-2 text-sm font-semibold text-[#004873] transition-colors hover:bg-[#e6e8ea]"
                >
                  Dashboard
                </Link>
              )}
              <NotificationsDropdown />
              {user.email ? (
                <UserDropdown
                  user={{
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    avatar: user.avatar,
                  }}
                />
              ) : null}
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-sky-800">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-gradient-to-b from-[#006098] to-[#007abf] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
              >
                Join Network
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-sm md:hidden">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-slate-200 pt-4">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={user.role === 'admin' || user.role === 'platform_manager' ? '/admin' : '/dashboard'}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#004873] hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.role === 'admin' || user.role === 'platform_manager' ? 'Admin' : 'Dashboard'}
                </Link>
                <Link
                  href="/settings"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block rounded-lg bg-[#006098] px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Join Network
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
