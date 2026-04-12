'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Boxes,
  Settings,
  ArrowLeft,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FolderKanban },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Store the intended destination so user returns to /admin after login
      router.replace('/auth/login?redirect_to=/admin');
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'admin' && parsed.role !== 'platform_manager') {
        router.replace('/dashboard');
        return;
      }

      setAuthorized(true);
    } catch {
      router.replace('/dashboard');
      return;
    } finally {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb]">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading admin workspace...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="space-y-4">
          <Card className="border-[#e6e8ea]">
            <CardHeader>
              <CardTitle className="text-lg">DFN Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className="block">
                    <div
                      className={[
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-[#cee5ff] text-[#004873]'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      ].join(' ')}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              <Separator className="my-3" />

              <Link href="/settings" className="block">
                <div
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === '/settings'
                      ? 'bg-[#cee5ff] text-[#004873]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  ].join(' ')}
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </div>
              </Link>

              <Link href="/dashboard" className="block">
                <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <ArrowLeft className="size-4" />
                  <span>Exit Admin</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
