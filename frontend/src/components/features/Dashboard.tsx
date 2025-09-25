'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProps {
  userName?: string;
  lastLogin?: string;
  stats?: Array<{ label: string; value: string }>;
}

export default function Dashboard({ userName, lastLogin, stats }: DashboardProps) {
  const firstName = useMemo(() => userName?.split(' ')[0] ?? 'there', [userName]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {firstName}!</h1>
        {lastLogin && <p className="text-muted-foreground">Last login: {lastLogin}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(stats ?? defaultStats).map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle>{item.value}</CardTitle>
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Updated moments ago.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const defaultStats = [
  { label: 'Active sessions', value: '0' },
  { label: 'Open alerts', value: '0' },
  { label: 'Last activity', value: 'N/A' }
];
