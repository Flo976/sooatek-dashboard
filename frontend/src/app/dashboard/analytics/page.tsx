import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/auth';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics' }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights about your data.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124,567</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unique Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,234</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bounce Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23.4%</div>
              <p className="text-xs text-muted-foreground">
                -2% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Analytics charts and visualizations will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}