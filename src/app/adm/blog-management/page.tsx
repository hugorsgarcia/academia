
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Edit, ArrowLeft, FileText } from 'lucide-react';
import { AdminCard } from '@/components/AdminCard';

export default function BlogManagementPage() {
  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/adm/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Gerenciamento de Artigos
            </h1>
          </div>
        </div>
        <p className="text-lg text-foreground/80 mb-10 max-w-3xl">
          Crie novos artigos para engajar seus leitores ou edite publicações existentes para manter seu blog atualizado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AdminCard
            title="Adicionar Novo Artigo"
            description="Escreva e publique um novo artigo no blog."
            icon={<PlusCircle className="h-8 w-8 text-primary" />}
            href="#" // Placeholder: Link to /adm/blog-management/new
            disabled // Enable when new article page is ready
          />
          <AdminCard
            title="Gerenciar Artigos Existentes"
            description="Edite, visualize ou remova artigos já publicados."
            icon={<Edit className="h-8 w-8 text-primary" />}
            href="#" // Placeholder: Link to /adm/blog-management/list
            disabled // Enable when article list/edit page is ready
          />
        </div>
      </section>
    </MainLayout>
  );
}
