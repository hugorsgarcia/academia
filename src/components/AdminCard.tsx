
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

export interface AdminCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  disabled?: boolean;
}

export function AdminCard({ title, description, icon, href, disabled }: AdminCardProps) {
  return (
    <Card className={`shadow-lg hover:shadow-primary/20 transition-shadow ${disabled ? 'opacity-60' : ''}`}>
      <CardHeader className="items-center text-center">
        {icon}
        <CardTitle className="font-headline mt-3 text-xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-foreground/70 mb-4 h-16">{description}</p>
        <Button asChild className="w-full" disabled={disabled}>
          <Link href={href}>{disabled ? "Em Breve" : "Acessar"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
