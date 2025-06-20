
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, Users, Activity, FileText, Settings, Sparkles } from 'lucide-react';
import { AdminCard } from '@/components/AdminCard'; // Import the extracted component

export default function AdminDashboardPage() {
  // This page should be protected and only accessible after admin login.
  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
            Painel Administrativo
          </h1>
           <Button variant="outline" asChild>
            <Link href="/">Sair</Link> {/* Placeholder logout */}
          </Button>
        </div>
        
        <p className="text-lg text-foreground/80 mb-10">
          Gerencie alunos, modalidades, conteúdo do site e mais.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AdminCard
            title="Gestão de Alunos"
            description="Cadastrar, editar e visualizar informações dos alunos."
            icon={<Users className="h-8 w-8 text-primary" />}
            href="#"
            disabled
          />
          <AdminCard
            title="Gestão de Modalidades"
            description="Adicionar, editar ou remover modalidades e horários."
            icon={<Activity className="h-8 w-8 text-primary" />}
            href="#"
            disabled
          />
          <AdminCard
            title="Gestão de Artigos (Blog)"
            description="Criar e gerenciar posts para o blog da academia."
            icon={<FileText className="h-8 w-8 text-primary" />}
            href="#" // This can be updated if general admin also manages blog
            disabled
          />
          <AdminCard
            title="Análise de Sentimento (IA)"
            description="Analisar reviews de alunos usando inteligência artificial."
            icon={<Sparkles className="h-8 w-8 text-primary" />}
            href="/admin/analise-reviews"
          />
          <AdminCard
            title="Conteúdo do Site"
            description="Editar informações da página inicial, depoimentos, etc."
            icon={<LayoutDashboard className="h-8 w-8 text-primary" />}
            href="#"
            disabled
          />
          <AdminCard
            title="Configurações"
            description="Configurações gerais do sistema e da academia."
            icon={<Settings className="h-8 w-8 text-primary" />}
            href="#"
            disabled
          />
        </div>
      </section>
    </MainLayout>
  );
}
