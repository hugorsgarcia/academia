'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Eye, 
  Tags,
  Calendar,
  User,
  Plus,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Título deve ter pelo menos 5 caracteres." }),
  slug: z.string().min(3, { message: "URL amigável deve ter pelo menos 3 caracteres." }),
  excerpt: z.string().min(10, { message: "Resumo deve ter pelo menos 10 caracteres." }),
  content: z.string().min(50, { message: "Conteúdo deve ter pelo menos 50 caracteres." }),
  category: z.string().min(1, { message: "Selecione uma categoria." }),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'scheduled'], { message: "Selecione um status." }),
  featuredImage: z.string().optional(),
  metaDescription: z.string().max(160).optional(),
  publishDate: z.string().optional(),
});

const categories = [
  { value: 'treino', label: 'Treino' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'saude', label: 'Saúde' },
  { value: 'motivacao', label: 'Motivação' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'dicas', label: 'Dicas' },
];

const predefinedTags = [
  'musculação', 'cardio', 'hipertrofia', 'emagrecimento', 'força',
  'resistência', 'flexibilidade', 'suplementação', 'dieta', 'proteína',
  'iniciantes', 'avançado', 'exercícios', 'alongamento', 'recovery'
];

export default function NewArticlePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('write');

  const form = useForm<z.infer<typeof articleFormSchema>>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      status: 'draft',
      featuredImage: '',
      metaDescription: '',
      publishDate: '',
    },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    if (!form.getValues('slug')) {
      form.setValue('slug', generateSlug(title));
    }
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  async function onSubmit(values: z.infer<typeof articleFormSchema>) {
    console.log("Article data:", { ...values, tags: selectedTags });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Artigo Salvo!",
      description: `O artigo "${values.title}" foi ${values.status === 'published' ? 'publicado' : 'salvo como rascunho'} com sucesso.`,
    });

    router.push('/adm/blog-management');
  }

  const previewContent = form.watch('content');
  const previewTitle = form.watch('title');
  const previewExcerpt = form.watch('excerpt');

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/adm/blog-management"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Criar Novo Artigo
            </h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="write">Escrever</TabsTrigger>
            <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
            <TabsTrigger value="seo">SEO & Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Conteúdo Principal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título do Artigo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Digite o título do artigo"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleTitleChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Amigável (Slug)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="url-amigavel-do-artigo"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resumo</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Breve resumo do artigo que aparecerá na listagem..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conteúdo do Artigo</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Escreva o conteúdo completo do artigo aqui. Você pode usar Markdown para formatação..."
                                  rows={15}
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Suporte a Markdown: **negrito**, *itálico*, # títulos, - listas, etc.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Publicação</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="draft">Rascunho</SelectItem>
                                  <SelectItem value="published">Publicado</SelectItem>
                                  <SelectItem value="scheduled">Agendado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="publishDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Publicação</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="flex-1">
                            <Save className="mr-2 h-4 w-4" />
                            Salvar
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('preview')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Categorização</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <FormLabel>Tags</FormLabel>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nova tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addTag(newTag)}
                                disabled={!newTag.trim()}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {predefinedTags.slice(0, 8).map((tag) => (
                                <Button
                                  key={tag}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6"
                                  onClick={() => addTag(tag)}
                                  disabled={selectedTags.includes(tag)}
                                >
                                  {tag}
                                </Button>
                              ))}
                            </div>

                            {selectedTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {selectedTags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                      onClick={() => removeTag(tag)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Imagem Destacada</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="featuredImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL da Imagem</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://exemplo.com/imagem.jpg"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="outline" size="sm" className="w-full mt-2" disabled>
                          Upload de Imagem (Em breve)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização do Artigo</CardTitle>
              </CardHeader>
              <CardContent>
                <article className="prose prose-gray max-w-none">
                  {previewTitle && (
                    <>
                      <h1 className="font-headline text-3xl font-bold mb-4">{previewTitle}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Admin
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date().toLocaleDateString('pt-BR')}
                        </div>
                        {selectedTags.length > 0 && (
                          <div className="flex items-center">
                            <Tags className="h-4 w-4 mr-1" />
                            {selectedTags.slice(0, 2).join(', ')}
                            {selectedTags.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {previewExcerpt && (
                    <p className="text-lg text-muted-foreground italic mb-6 border-l-4 border-primary pl-4">
                      {previewExcerpt}
                    </p>
                  )}
                  
                  {previewContent ? (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {previewContent}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Comece a escrever para ver a pré-visualização...</p>
                  )}
                </article>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrição que aparecerá nos resultados de busca (máximo 160 caracteres)"
                          rows={3}
                          maxLength={160}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/160 caracteres
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h4 className="font-medium">Pré-visualização no Google</h4>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="text-blue-600 text-lg font-medium">
                      {previewTitle || 'Título do artigo'}
                    </div>
                    <div className="text-green-700 text-sm">
                      academia.com/blog/{form.watch('slug') || 'url-do-artigo'}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {form.watch('metaDescription') || previewExcerpt || 'Meta descrição aparecerá aqui...'}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Dicas de SEO</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use palavras-chave no título e na meta descrição</li>
                    <li>• Mantenha a meta descrição entre 120-160 caracteres</li>
                    <li>• Use tags relevantes para melhor categorização</li>
                    <li>• Escolha uma URL amigável e descritiva</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
}