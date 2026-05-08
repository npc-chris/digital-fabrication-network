'use client';

import { useEffect, useState } from 'react';
import { Boxes, ListMinus, PackagePlus, Search, Wrench } from 'lucide-react';

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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { adminClient, type ListingItem } from '../_lib/admin-client';

type ListingKind = 'component' | 'service';

type InventoryRecord = {
  id: number;
  kind: ListingKind;
  item: ListingItem;
};

export default function AdminInventoryPage() {
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | ListingKind>('all');
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyRecordId, setBusyRecordId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<InventoryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryRecord | null>(null);
  const [error, setError] = useState('');

  const loadListings = async (runAsRefresh = false) => {
    if (runAsRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');
    try {
      const [components, services] = await Promise.all([
        adminClient.getComponentListings(search),
        adminClient.getServiceListings(search),
      ]);

      const merged: InventoryRecord[] = [
        ...components.map((item) => ({ id: item.id, kind: 'component' as const, item })),
        ...services.map((item) => ({ id: item.id, kind: 'service' as const, item })),
      ];

      setRecords(merged);
    } catch {
      setError('Unable to load inventory listings right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredRecords = records.filter((record) => {
    if (kindFilter === 'all') {
      return true;
    }
    return record.kind === kindFilter;
  });

  const removeListing = async (record: InventoryRecord) => {
    const busyKey = `${record.kind}-${record.id}`;
    setBusyRecordId(busyKey);
    try {
      if (record.kind === 'component') {
        await adminClient.removeComponentListing(record.id);
      } else {
        await adminClient.removeServiceListing(record.id);
      }

      setDeleteTarget(null);
      setSelectedRecord((prev) => (prev?.id === record.id && prev?.kind === record.kind ? null : prev));
      await loadListings(true);
    } finally {
      setBusyRecordId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="font-semibold">Inventory Ops</Badge>
        <h1 className="text-3xl font-black tracking-tight">Inventory Control</h1>
        <p className="text-sm text-muted-foreground">
          Manage product and service listings including deletion, bulk addition planning, and catalog integrity checks.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Listing Controls</CardTitle>
          <CardDescription>Filter inventory, inspect records, and remove obsolete listings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
          <div className="grid gap-2">
            <Label htmlFor="inventory-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="inventory-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, location, provider"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={kindFilter} onValueChange={(value) => setKindFilter(value as 'all' | ListingKind)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="component">Components</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => loadListings(true)} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Apply'}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Product Listings</CardDescription>
              <CardTitle className="text-3xl font-black">{records.filter((record) => record.kind === 'component').length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
              <Boxes className="size-4" />
              <span className="text-sm">Active component listings available across marketplace feeds</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Service Listings</CardDescription>
              <CardTitle className="text-3xl font-black">{records.filter((record) => record.kind === 'service').length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-muted-foreground">
              <Wrench className="size-4" />
              <span className="text-sm">Published service offers available to procurement workflows</span>
            </CardContent>
          </Card>
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Listings</CardTitle>
          <CardDescription>Responsive table/cards with inspect and remove actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const busyKey = `${record.kind}-${record.id}`;
                  return (
                    <TableRow key={busyKey}>
                      <TableCell>{record.item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{record.kind}</Badge>
                      </TableCell>
                      <TableCell>
                        {record.item.providerCompany || `${record.item.providerName || ''} ${record.item.providerLastName || ''}`.trim() || '-'}
                      </TableCell>
                      <TableCell>{record.item.location || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>Inspect</Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(record)} disabled={busyRecordId === busyKey}>
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredRecords.map((record) => {
              const busyKey = `${record.kind}-${record.id}`;
              return (
                <div key={busyKey} className="rounded-xl border border-border p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="font-semibold leading-tight">{record.item.name}</p>
                    <Badge variant="outline" className="capitalize">{record.kind}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{record.item.providerCompany || record.item.location || 'No listing metadata'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)}>Inspect</Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(record)} disabled={busyRecordId === busyKey}>
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Action Model</CardTitle>
          <CardDescription>Operational actions this page governs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <PackagePlus className="size-4" />
              Bulk Addition
            </div>
            Queue and validate catalog ingestion batches before publishing.
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <ListMinus className="size-4" />
              Deletion Controls
            </div>
            Remove obsolete listings with explicit confirmation and auditability.
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <Boxes className="size-4" />
              Integrity Checks
            </div>
            Validate listing completeness and enforce metadata quality rules.
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.item.name || 'Listing'}</DialogTitle>
            <DialogDescription>Inspect listing metadata before taking inventory action.</DialogDescription>
          </DialogHeader>

          {selectedRecord ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Type:</span> <span className="capitalize">{selectedRecord.kind}</span></p>
              <p><span className="font-medium text-foreground">Location:</span> {selectedRecord.item.location || '-'}</p>
              <p>
                <span className="font-medium text-foreground">Provider:</span>{' '}
                {selectedRecord.item.providerCompany || `${selectedRecord.item.providerName || ''} ${selectedRecord.item.providerLastName || ''}`.trim() || '-'}
              </p>
              <Button variant="destructive" onClick={() => setDeleteTarget(selectedRecord)}>
                Remove Listing
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Listing Removal</DialogTitle>
            <DialogDescription>
              This action removes the listing from marketplace inventory. Continue?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {deleteTarget ? `${deleteTarget.item.name} (${deleteTarget.kind})` : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={Boolean(deleteTarget && busyRecordId === `${deleteTarget.kind}-${deleteTarget.id}`)}
                onClick={() => deleteTarget && removeListing(deleteTarget)}
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
