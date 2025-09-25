import Link from 'next/link';

import LoginForm from '@/components/features/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">Access your Sooatek dashboard.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginForm />
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <Link className="text-primary hover:underline" href="/register">
                Create an account
              </Link>{' '}
              ·{' '}
              <Link className="text-primary hover:underline" href="/password-reset">
                Forgot password?
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
