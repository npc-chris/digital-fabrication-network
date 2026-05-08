'use client';

import Link from 'next/link';

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';

export default function AdminVerificationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="font-semibold">Workflow Update</Badge>
        <h1 className="text-3xl font-black tracking-tight">Verification Queue Moved</h1>
        <p className="text-sm text-muted-foreground">
          Verification review now runs as a modal workflow on the admin Overview screen.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Use Overview Queue Controls</CardTitle>
          <CardDescription>
            Open Verifications from the Queue Controls block to approve or reject documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin" className="text-sm font-semibold text-[#006098] hover:underline">
            Return to Overview
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
