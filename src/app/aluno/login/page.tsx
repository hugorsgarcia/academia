
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginForm } from '@/components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
  return (
    <MainLayout className="flex items-center justify-center min-h-[calc(100vh-128px)]"> {/* Adjust 128px based on header/footer height */}
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">Área do Aluno</CardTitle>
          <CardDescription>Acesse seus treinos, horários e informações.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm userType="student" />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
