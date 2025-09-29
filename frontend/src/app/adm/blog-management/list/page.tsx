'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Edit,
  Eye,
  Trash2,
  Plus,
  Calendar,
  User,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Mock data for articles
const mockArticles = [
  {
    id: 1,
    title: '5 Dicas para Começar na Academia',
    slug: '5-dicas-para-comecar-na-academia',
    excerpt: 'Começar na academia pode ser desafiador. Aqui estão 5 dicas essenciais para iniciantes.',
    status: 'published',
    category: 'Dicas',
    author: 'Admin',
    publishDate: '2024-03-15',
    views: 1250,
    tags: ['iniciantes', 'dicas', 'academia'],
  },
  {
    id: 2,
    title: 'A Importância da Nutrição para Maximizar Seus Treinos',
    slug: 'importancia-nutricao-treino',
    excerpt: 'Descubra como uma alimentação adequada pode potencializar seus resultados na academia.',
    status: 'published',
    category: 'Nutrição',
    author: 'Admin',
    publishDate: '2024-03-10',
    views: 890,
    tags: ['nutrição', 'treino', 'alimentação'],
  },
  {
    id: 3,
    title: 'Treino Funcional: Benefícios Além da Estética',
    slug: 'beneficios-treino-funcional',
    excerpt: 'Saiba como o treino funcional pode melhorar sua força, equilíbrio, agilidade e qualidade de vida.',
    status: 'draft',
    category: 'Treino',
    author: 'Admin',
    publishDate: '2024-03-20',
    views: 0,
    tags: ['treino funcional', 'benefícios', 'qualidade de vida'],
  },
  {
    id: 4,
    title: 'Como Escolher o Melhor Suplemento Proteico',
    slug: 'como-escolher-suplemento-proteico',
    excerpt: 'Guia completo para escolher o suplemento proteico ideal para seus objetivos.',
    status: 'scheduled',
    category: 'Suplementação',
    author: 'Admin',
    publishDate: '2024-03-25',
    views: 0,
    tags: ['suplementos', 'proteína', 'guia'],
  },
];

const categories = ['Todos', 'Dicas', 'Nutrição', 'Treino', 'Suplementação', 'Motivação'];
const statuses = ['Todos', 'published', 'draft', 'scheduled'];

export default function ArticleListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || article.category === filterCategory;
    const matchesStatus = filterStatus === 'Todos' || article.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Agendado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDelete = (articleId: number) => {
    console.log('Deletar artigo:', articleId);
    // Implement delete logic here
  };

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="mr-4" asChild>
              <Link href="/adm/blog-management"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                Artigos do Blog
              </h1>
              <p className="text-foreground/70 mt-2">
                Gerencie todos os artigos publicados e rascunhos
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/adm/blog-management/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Artigo
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'Todos' ? 'Todos' : 
                       status === 'published' ? 'Publicado' :
                       status === 'draft' ? 'Rascunho' : 'Agendado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(article.status)}
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${article.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/adm/blog-management/edit/${article.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Artigo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza de que deseja excluir o artigo "{article.title}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(article.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/70 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {article.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(article.publishDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {article.status === 'published' && (
                  <div className="text-xs text-muted-foreground">
                    <Eye className="inline h-3 w-3 mr-1" />
                    {article.views.toLocaleString()} visualizações
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={`/adm/blog-management/edit/${article.id}`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" asChild>
                    <Link href={`/blog/${article.slug}`} target="_blank">
                      <Eye className="mr-1 h-3 w-3" />
                      Ver
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum artigo encontrado</h3>
              <p className="text-foreground/60 mb-6">
                Não foram encontrados artigos com os filtros selecionados.
              </p>
              <Button asChild>
                <Link href="/adm/blog-management/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Artigo
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary">
                  {mockArticles.filter(a => a.status === 'published').length}
                </h3>
                <p className="text-sm text-muted-foreground">Publicados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-amber-600">
                  {mockArticles.filter(a => a.status === 'draft').length}
                </h3>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  {mockArticles.filter(a => a.status === 'scheduled').length}
                </h3>
                <p className="text-sm text-muted-foreground">Agendados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {mockArticles.reduce((total, article) => total + article.views, 0).toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">Total de Visualizações</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}