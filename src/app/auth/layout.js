'use client';

import { AuthProvider } from '@/lib/firebase/auth-context';

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
