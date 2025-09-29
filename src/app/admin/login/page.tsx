
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginForm } from '@/components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <MainLayout className="flex items-center justify-center min-h-[calc(100vh-128px)]">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Acesso Restrito</CardTitle>
          <CardDescription>Painel de Administração - Academia Corpo em Ação</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm userType="admin" />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
