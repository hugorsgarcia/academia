
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, UserCircle } from 'lucide-react';

const blogPosts = [
  {
    slug: '5-dicas-para-comecar-na-academia',
    title: '5 Dicas Essenciais para Iniciantes na Academia',
    date: '15 de Julho, 2024',
    author: 'Equipe Corpo em Ação',
    excerpt: 'Começar na academia pode ser desafiador. Confira nossas dicas para um início de sucesso e motivação!',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'gym beginner workout'
  },
  {
    slug: 'importancia-nutricao-treino',
    title: 'A Importância da Nutrição para Maximizar Seus Treinos',
    date: '10 de Julho, 2024',
    author: 'Nutricionista Ana Paula',
    excerpt: 'Descubra como uma alimentação equilibrada pode potencializar seus resultados na academia e melhorar sua saúde.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'healthy food fitness'
  },
  {
    slug: 'beneficios-treino-funcional',
    title: 'Treino Funcional: Benefícios Além da Estética',
    date: '05 de Julho, 2024',
    author: 'Coach Carlos Lima',
    excerpt: 'Saiba como o treino funcional pode melhorar sua força, equilíbrio, agilidade e qualidade de vida.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'functional training group'
  },
];

export default function BlogPage() {
  return (
    <MainLayout>
      <section className="text-center py-12 md:py-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Nosso Blog</h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Dicas de treino, nutrição, saúde e motivação para você alcançar seus objetivos e viver melhor.
        </p>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out transform hover:scale-105">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative w-full h-56">
                  <Image
                    src={post.image}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={post.imageHint}
                  />
                </div>
              </Link>
              <CardHeader>
                <Link href={`/blog/${post.slug}`}>
                  <CardTitle className="font-headline text-xl md:text-2xl text-foreground hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
                <div className="flex items-center space-x-4 text-sm text-foreground/60 mt-2">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {post.date}
                  </div>
                  <div className="flex items-center">
                    <UserCircle className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-foreground/70 leading-relaxed">
                  {post.excerpt}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="p-0 text-primary hover:underline">
                  <Link href={`/blog/${post.slug}`}>Ler Mais &rarr;</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
