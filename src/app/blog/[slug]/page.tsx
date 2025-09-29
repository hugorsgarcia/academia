
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarDays, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// In a real app, you'd fetch this data based on the slug
async function getPostData(slug: string) {
  // Placeholder data
  if (slug === '5-dicas-para-comecar-na-academia') {
    return {
      title: '5 Dicas Essenciais para Iniciantes na Academia',
      date: '15 de Julho, 2024',
      author: 'Equipe Corpo em Ação',
      image: 'https://placehold.co/800x400.png',
      imageHint: 'gym beginner workout plan',
      content: `
        <p>Começar uma jornada na academia é um passo incrível para sua saúde e bem-estar! No entanto, para muitos iniciantes, pode parecer um pouco intimidante. Não se preocupe, estamos aqui para ajudar! Confira 5 dicas essenciais para você começar com o pé direito e manter a motivação em alta:</p>
        
        <h2 class="font-headline text-2xl font-semibold my-4 text-foreground">1. Defina Metas Claras e Realistas</h2>
        <p>O que você espera alcançar? Perder peso, ganhar massa muscular, melhorar o condicionamento físico ou simplesmente ter um estilo de vida mais ativo? Definir metas claras e, o mais importante, realistas, ajudará a manter o foco e a medir seu progresso. Comece com metas pequenas e vá aumentando gradualmente.</p>
        
        <h2 class="font-headline text-2xl font-semibold my-4 text-foreground">2. Peça Ajuda Profissional</h2>
        <p>Não tenha receio de conversar com os instrutores da academia. Eles são qualificados para montar um treino adequado às suas necessidades e objetivos, além de ensinarem a forma correta de executar os exercícios, prevenindo lesões. Uma avaliação física inicial também é fundamental.</p>
        
        <h2 class="font-headline text-2xl font-semibold my-4 text-foreground">3. Comece Devagar e Progrida Gradualmente</h2>
        <p>É comum sentir empolgação no início e querer treinar todos os dias com alta intensidade. No entanto, seu corpo precisa de tempo para se adaptar. Comece com 2-3 dias por semana e aumente a frequência e a intensidade dos treinos gradualmente. Respeite seus limites e ouça seu corpo.</p>
        
        <h2 class="font-headline text-2xl font-semibold my-4 text-foreground">4. Varie Seus Treinos</h2>
        <p>Fazer sempre os mesmos exercícios pode se tornar monótono e levar à estagnação dos resultados. Experimente diferentes modalidades, como musculação, aulas coletivas, cardio. A variedade mantém o treino interessante e desafia seu corpo de novas maneiras.</p>
        
        <h2 class="font-headline text-2xl font-semibold my-4 text-foreground">5. Seja Consistente e Paciente</h2>
        <p>Resultados significativos não aparecem da noite para o dia. A consistência é a chave para o sucesso na academia. Mantenha uma rotina regular de treinos e seja paciente com seu progresso. Celebre cada pequena vitória e lembre-se do porquê você começou.</p>
        
        <p>Lembre-se: o mais importante é encontrar uma atividade que você goste e que se encaixe na sua rotina. A Academia Corpo em Ação está aqui para te apoiar em cada passo dessa jornada. Vamos juntos!</p>
      `
    };
  }
  return null; // Or throw 404
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);

  if (!post) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h1 className="font-headline text-3xl font-bold">Post não encontrado</h1>
          <p className="mt-4 text-lg text-foreground/70">O artigo que você está procurando não existe ou foi movido.</p>
          <Button asChild className="mt-8">
            <Link href="/blog">Voltar ao Blog</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article className="py-12 md:py-16 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-foreground/60">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" />
              {post.date}
            </div>
            <div className="flex items-center">
              <UserCircle className="h-4 w-4 mr-1" />
              {post.author}
            </div>
          </div>
        </header>

        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8 shadow-md">
          <Image
            src={post.image}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={post.imageHint}
          />
        </div>

        <div
          className="prose prose-lg max-w-none text-foreground/80 leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="mt-12 pt-8 border-t border-border/40">
          <Button asChild variant="outline">
            <Link href="/blog"> &larr; Voltar para o Blog</Link>
          </Button>
        </div>
      </article>
    </MainLayout>
  );
}

// This function can be used to generate static paths if you have a list of all blog slugs
// export async function generateStaticParams() {
//   // Example: fetch all blog slugs from a CMS or database
//   const slugs = ['5-dicas-para-comecar-na-academia', 'importancia-nutricao-treino', 'beneficios-treino-funcional'];
//   return slugs.map((slug) => ({ slug }));
// }
