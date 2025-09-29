
import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-8 sm:px-6 lg:px-8 ${className || ''}`}>
      {children}
    </div>
  );
}
