import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import internalApiClient from '@/lib/api/internal-client';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data } = await internalApiClient.post('/auth/login', {
            email: credentials.email,
            password: credentials.password
          });

          console.log('NextAuth - API Response:', data);

          if (!data?.accessToken || !data?.user) {
            console.log('NextAuth - Missing token or user in response');
            return null;
          }

          const result = {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          };

          console.log('NextAuth - Returning user:', result);
          return result as any;
        } catch (error) {
          console.log('NextAuth - Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      if (token?.refreshToken) {
        (session as any).refreshToken = token.refreshToken;
      }

      return session;
    }
  }
};
