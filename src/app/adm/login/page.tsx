
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginForm } from '@/components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePenLine } from 'lucide-react'; // Or another relevant icon

export default function AdmLoginPage() {
  return (
    <MainLayout className="flex items-center justify-center min-h-[calc(100vh-128px)]">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FilePenLine className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Acesso Restrito - Blog</CardTitle>
          <CardDescription>Painel de Gerenciamento do Blog</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm userType="admin" onLoginSuccessRedirectPath="/adm/dashboard" />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
