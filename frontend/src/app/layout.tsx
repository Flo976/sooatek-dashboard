import type { Metadata } from 'next';
import { ReactNode } from 'react';

import AuthProvider from '@/providers/auth-provider';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'SooatekApp',
  description: 'Authentication and dashboard portal'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
