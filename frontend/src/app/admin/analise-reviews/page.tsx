
import { MainLayout } from '@/components/layout/MainLayout';
import { SentimentAnalysisForm } from '@/components/SentimentAnalysisForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function SentimentAnalysisPage() {
  // This page should be protected and only accessible after admin login.
  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Análise de Sentimento de Reviews</h1>
          <p className="mt-3 text-lg text-foreground/80 max-w-2xl mx-auto">
            Utilize nossa IA para analisar o sentimento expresso em reviews de alunos e obter insights valiosos.
          </p>
        </div>

        <Card className="w-full max-w-2xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Analisar Novo Review</CardTitle>
            <CardDescription>
              Cole o texto do review abaixo para obter uma análise de sentimento, incluindo pontuação, rótulo e um resumo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SentimentAnalysisForm />
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
