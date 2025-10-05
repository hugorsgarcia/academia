"use client";

import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
}

export function AuthRedirect({ 
  children, 
  redirectIfAuthenticated = false 
}: AuthRedirectProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && redirectIfAuthenticated && isAuthenticated && user) {
      // If user is already authenticated, redirect to appropriate dashboard
      if (user.role === 'student') {
        router.push('/aluno');
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, isLoading, redirectIfAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we should redirect, don't render children
  if (redirectIfAuthenticated && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}