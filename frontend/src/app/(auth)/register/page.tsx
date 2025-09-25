import Link from 'next/link';

import RegisterForm from '@/components/features/RegisterForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">Join Sooatek to access your dashboard.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <RegisterForm />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link className="text-primary hover:underline" href="/login">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
