import { redirect } from 'next/navigation';

import Dashboard from '@/components/features/Dashboard';
import UserMenu from '@/components/features/UserMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userName = session.user?.name ?? session.user?.email ?? 'User';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">Sooatek Dashboard</h1>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Dashboard userName={userName} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
