'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, ShieldCheck, Package, FileSearch } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  adminClient,
  type AdminStats,
  type ProviderRequest,
  type VerificationItem,
} from './_lib/admin-client';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [providers, setProviders] = useState<ProviderRequest[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [providersError, setProvidersError] = useState('');
  const [verificationsError, setVerificationsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyProviderId, setBusyProviderId] = useState<number | null>(null);
  const [busyVerificationId, setBusyVerificationId] = useState<number | null>(null);
  const [providersModalOpen, setProvidersModalOpen] = useState(false);
  const [verificationsModalOpen, setVerificationsModalOpen] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    setProvidersError('');
    setVerificationsError('');

    try {
      const [statsResult, providerResult, verificationResult] = await Promise.allSettled([
        adminClient.getStats(),
        adminClient.getProviderRequests(),
        adminClient.getVerifications(),
      ]);

      if (statsResult.status === 'rejected') {
        throw new Error('stats-unavailable');
      }

      setStats(statsResult.value);

      if (providerResult.status === 'fulfilled') {
        setProviders(providerResult.value);
      } else {
        setProviders([]);
        setProvidersError('Provider queue is temporarily unavailable.');
      }

      if (verificationResult.status === 'fulfilled') {
        setVerifications(verificationResult.value);
      } else {
        setVerifications([]);
        setVerificationsError('Verification queue is temporarily unavailable.');
      }
    } catch {
      setError('Failed to load admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const reviewProvider = async (id: number, approved: boolean) => {
    setBusyProviderId(id);

    try {
      if (approved) {
        // Set user role to provider (no approval queue anymore)
        await adminClient.setUserRole(id, 'provider');
      } else {
        // Reject by keeping user as explorer
        await adminClient.setUserRole(id, 'explorer');
      }
      await loadOverview();
    } finally {
      setBusyProviderId(null);
    }
  };

  const reviewVerification = async (id: number, status: 'approved' | 'rejected') => {
    const notes = status === 'rejected' ? window.prompt('Reason for rejection:') ?? '' : '';
    setBusyVerificationId(id);

    try {
      await adminClient.reviewVerification(id, status, notes);
      await loadOverview();
    } finally {
      setBusyVerificationId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overview unavailable</CardTitle>
          <CardDescription>{error || 'No data returned from admin API.'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const kpis = [
    {
      label: 'Total Users',
      value: stats.users.total,
      meta: `${stats.users.explorers} explorers / ${stats.users.providers} providers`,
      icon: Users,
      tone: 'bg-[#cee5ff] text-[#004873]',
    },
    {
      label: 'Provider Requests',
      value: providers.length,
      meta: 'Pending approvals available in Overview modal',
      icon: ShieldCheck,
      tone: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Verification Queue',
      value: verifications.length,
      meta: 'Identity review queue available in Overview modal',
      icon: BarChart3,
      tone: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Published Content',
      value: stats.content.posts,
      meta: `${stats.content.components} components / ${stats.content.services} services`,
      icon: Package,
      tone: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="font-semibold">Operations</Badge>
        <h1 className="text-3xl font-black tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">
          Provider approvals and verification reviews are handled here via modal workflows.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-[#e6e8ea] bg-white">
              <CardHeader className="pb-3">
                <CardDescription className="font-medium">{kpi.label}</CardDescription>
                <CardTitle className="text-3xl font-black tracking-tight">{kpi.value}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{kpi.meta}</p>
                <div className={`rounded-lg p-2 ${kpi.tone}`}>
                  <Icon className="size-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Queue Controls</CardTitle>
              <CardDescription>Provider requests and verifications are processed as modal flows from this screen.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-3 text-left text-sm transition-colors hover:bg-muted"
                onClick={() => setProvidersModalOpen(true)}
              >
                <span className="font-medium">Provider Requests</span>
                <Badge variant="outline">{providers.length}</Badge>
              </button>
              {providersError ? (
                <p className="text-xs text-amber-700">{providersError}</p>
              ) : null}
              <button
                type="button"
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-3 text-left text-sm transition-colors hover:bg-muted"
                onClick={() => setVerificationsModalOpen(true)}
              >
                <span className="font-medium">Verifications</span>
                <Badge variant="outline">{verifications.length}</Badge>
              </button>
              {verificationsError ? (
                <p className="text-xs text-amber-700">{verificationsError}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operator Steps</CardTitle>
              <CardDescription>Suggested sequence for each admin execution cycle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">1. Process Provider Requests modal queue.</div>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">2. Clear Verification queue and resolve rejected evidence.</div>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">3. Review Users for role and access policy enforcement.</div>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">4. Execute Content and Inventory moderation cycles.</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Execution Workflow</CardTitle>
            <CardDescription>Continue your moderation cycle from here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Next Steps</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>Review {providers.length} pending provider approvals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Process {verifications.length} verification documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Audit content moderation queue</span>
                </li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setProvidersModalOpen(true)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
              >
                Open Providers
              </button>
              <button
                onClick={() => setVerificationsModalOpen(true)}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
              >
                Open Verifications
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={providersModalOpen} onOpenChange={setProvidersModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Provider Requests</DialogTitle>
            <DialogDescription>Approve or reject provider applications without leaving Overview.</DialogDescription>
          </DialogHeader>

          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending provider requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {item.firstName || item.lastName
                            ? `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
                            : item.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.company || '-'}</TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewProvider(item.id, true)}
                          disabled={busyProviderId === item.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reviewProvider(item.id, false)}
                          disabled={busyProviderId === item.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={verificationsModalOpen} onOpenChange={setVerificationsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Verification Queue</DialogTitle>
            <DialogDescription>Approve or reject identity records without leaving Overview.</DialogDescription>
          </DialogHeader>

          {verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending verification records.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {item.user?.firstName || item.user?.lastName
                            ? `${item.user?.firstName ?? ''} ${item.user?.lastName ?? ''}`.trim()
                            : item.user?.email ?? 'Unknown user'}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.user?.email ?? '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{String(item.documentType ?? 'document')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {String(item.status ?? 'pending')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.submittedAt ? new Date(String(item.submittedAt)).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewVerification(item.id, 'approved')}
                          disabled={busyVerificationId === item.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reviewVerification(item.id, 'rejected')}
                          disabled={busyVerificationId === item.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
