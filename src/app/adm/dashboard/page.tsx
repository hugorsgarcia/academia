
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, LogOut } from 'lucide-react';
import { AdminCard } from '@/components/AdminCard';

export default function AdmDashboardPage() {
  // This page should be protected and only accessible after admin login.
  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
            Painel de Controle - Blog
          </h1>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Link>
          </Button>
        </div>
        
        <p className="text-lg text-foreground/80 mb-10">
          Bem-vindo(a) ao painel de gerenciamento de conteúdo do blog.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AdminCard
            title="Gerenciar Artigos do Blog"
            description="Criar, editar, visualizar e remover artigos do blog."
            icon={<FileText className="h-8 w-8 text-primary" />}
            href="/adm/blog-management"
            disabled={false} 
          />
          {/* Add more cards here if needed for blog-specific admin tasks */}
        </div>
      </section>
    </MainLayout>
  );
}
