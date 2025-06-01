
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, FileText, DollarSign, UserCircle } from 'lucide-react';

export default function StudentDashboardPage() {
  // This page should be protected and only accessible after login.
  // For now, it's a public page.

  const studentName = "Aluno Exemplo"; // Replace with actual student data

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
            Bem-vindo(a), {studentName}!
          </h1>
          <Button variant="outline" asChild>
            <Link href="/">Sair</Link>
          </Button>
        </div>
        
        <p className="text-lg text-foreground/80 mb-10">
          Aqui você pode gerenciar seus treinos, pagamentos e informações pessoais.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Meus Horários</CardTitle>
              <CalendarDays className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-4">Acesse sua agenda de treinos e aulas marcadas.</p>
              <Button asChild className="w-full">
                <Link href="/aluno/horarios">Ver Horários</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Plano Alimentar</CardTitle>
              <FileText className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-4">Confira seu plano alimentar personalizado (em breve).</p>
              <Button disabled className="w-full">Ver Plano (Em breve)</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Meus Pagamentos</CardTitle>
              <DollarSign className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-4">Acesse seus boletos e histórico de pagamentos (em breve).</p>
              <Button disabled className="w-full">Ver Boletos (Em breve)</Button>
            </CardContent>
          </Card>

           <Card className="shadow-lg hover:shadow-primary/20 transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium font-headline">Meu Perfil</CardTitle>
              <UserCircle className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-4">Atualize suas informações pessoais e de contato.</p>
              <Button disabled className="w-full">Editar Perfil (Em breve)</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
