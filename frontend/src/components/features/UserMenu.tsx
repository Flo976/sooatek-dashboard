'use client';

import { signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export default function UserMenu() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">
        <p className="font-medium">{user?.name ?? 'Authenticated user'}</p>
        <p className="text-muted-foreground">{user?.email ?? 'email@domain.com'}</p>
      </div>
      <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
        Logout
      </Button>
    </div>
  );
}
