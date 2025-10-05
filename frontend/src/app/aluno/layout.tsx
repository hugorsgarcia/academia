import { ReactNode } from 'react';

interface AlunoLayoutProps {
  children: ReactNode;
}

export default function AlunoLayout({ children }: AlunoLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}