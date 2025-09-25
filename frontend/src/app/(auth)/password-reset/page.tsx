import PasswordResetForm from '@/components/features/PasswordResetForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PasswordResetPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function PasswordResetPage({ searchParams }: PasswordResetPageProps) {
  const tokenParam = typeof searchParams?.token === 'string' ? searchParams.token : undefined;
  const mode = tokenParam ? 'confirm' : 'request';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'request' ? 'Reset your password' : 'Set a new password'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'request'
              ? 'Enter your email and we will send you a reset link if an account exists.'
              : 'Provide your reset token and choose a new secure password.'}
          </p>
        </CardHeader>
        <CardContent>
          <PasswordResetForm mode={mode} token={tokenParam} />
        </CardContent>
      </Card>
    </div>
  );
}
