'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md space-y-4">
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-10 w-full" />
           <Skeleton className="h-10 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
