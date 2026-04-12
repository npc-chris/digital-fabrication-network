'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  UserCog,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { adminClient, type AdminUser } from '../_lib/admin-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getUsers(search, role, 1);
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const providerCount = useMemo(
    () => users.filter((u) => u.role === 'provider').length,
    [users]
  );

  const withAction = async (userId: number, action: () => Promise<void>) => {
    setBusyUserId(userId);
    try {
      await action();
      await loadUsers();
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRoleChange = (value: string | null) => {
    setRole(value ?? 'all');
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary" className="font-semibold">Operations</Badge>
        <h1 className="text-3xl font-black tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Control role upgrades, account trust state, and moderation actions from one queue.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-2xl font-black">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Provider Accounts</CardDescription>
            <CardTitle className="text-2xl font-black">{providerCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Explorer Accounts</CardDescription>
            <CardTitle className="text-2xl font-black">{users.length - providerCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>Filter users before executing role or ban operations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <div className="grid gap-2">
            <Label htmlFor="user-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="user-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Email, name, company"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="explorer">Explorer</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={loadUsers}>Apply</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Table</CardTitle>
          <CardDescription>Role and trust actions are intentionally explicit and per-row.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.isVerified ? <Badge>Verified</Badge> : <Badge variant="secondary">Pending</Badge>}
                    </TableCell>
                    <TableCell>
                      {user.providerApproved ? <Badge>Approved</Badge> : <Badge variant="secondary">No</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        {user.role !== 'provider' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => withAction(user.id, () => adminClient.setUserRole(user.id, 'provider'))}
                            disabled={busyUserId === user.id}
                          >
                            <ShieldCheck data-icon="inline-start" />
                            Upgrade
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => withAction(user.id, () => adminClient.setUserRole(user.id, 'explorer'))}
                            disabled={busyUserId === user.id}
                          >
                            <UserCog data-icon="inline-start" />
                            Downgrade
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant={user.banned ? 'secondary' : 'destructive'}
                          onClick={() => withAction(user.id, () => adminClient.setUserBan(user.id, !user.banned))}
                          disabled={busyUserId === user.id}
                        >
                          <ShieldAlert data-icon="inline-start" />
                          {user.banned ? 'Unban' : 'Ban'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
