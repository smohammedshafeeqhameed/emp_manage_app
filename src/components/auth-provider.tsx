'use client';

import { useUser } from '@/firebase';
import { usePathname, redirect } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

function LoadingScreen() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
}


export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, claims } = useUser();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      redirect('/login');
    }
    if (!loading && user && isAuthPage) {
      redirect('/dashboard');
    }
  }, [user, loading, isAuthPage, pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user && !isAuthPage) {
    return <LoadingScreen />;
  }
  
  if (user && isAuthPage) {
     return <LoadingScreen />;
  }

  if (user && !isAuthPage) {
    return <MainLayout>{children}</MainLayout>;
  }

  return <>{children}</>;
}
