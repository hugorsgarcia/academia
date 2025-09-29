
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { analyzeReviewSentiment, type AnalyzeReviewSentimentOutput } from '@/ai/flows/analyze-review-sentiment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Smile, Meh, Frown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


const formSchema = z.object({
  reviewText: z.string().min(10, { message: "O review deve ter pelo menos 10 caracteres." }),
});

export function SentimentAnalysisForm() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeReviewSentimentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewText: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeReviewSentiment({ reviewText: values.reviewText });
      setAnalysisResult(result);
      toast({
        title: "Análise Concluída!",
        description: "O sentimento do review foi analisado com sucesso.",
      });
    } catch (err) {
      console.error("Erro na análise de sentimento:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(`Falha ao analisar o review: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Erro na Análise",
        description: `Não foi possível analisar o review. ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getSentimentIcon = (label: string) => {
    if (label.toLowerCase().includes('positive')) return <Smile className="h-6 w-6 text-green-500" />;
    if (label.toLowerCase().includes('negative')) return <Frown className="h-6 w-6 text-red-500" />;
    return <Meh className="h-6 w-6 text-yellow-500" />;
  };
  
  const getSentimentColor = (score: number): string => {
    if (score > 0.3) return 'bg-green-500';
    if (score < -0.3) return 'bg-red-500';
    return 'bg-yellow-500';
  };


  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="reviewText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto do Review</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite ou cole o review do aluno aqui..."
                    rows={6}
                    {...field}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Analisando..." : "Analisar Sentimento"}
          </Button>
        </form>
      </Form>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center space-x-2 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive text-base">Erro na Análise</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-destructive/80">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="font-headline text-xl flex items-center">
              Resultado da Análise 
              <CheckCircle className="h-6 w-6 text-green-500 ml-2" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-foreground/80">Sentimento:</span>
              <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                {getSentimentIcon(analysisResult.sentimentLabel)}
                <span className="font-semibold">{analysisResult.sentimentLabel}</span>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-foreground/80">Pontuação: {analysisResult.sentimentScore.toFixed(2)}</span>
              <Progress 
                value={(analysisResult.sentimentScore + 1) * 50} 
                className="h-3 mt-1" 
                indicatorClassName={getSentimentColor(analysisResult.sentimentScore)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>Muito Negativo</span>
                <span>Neutro</span>
                <span>Muito Positivo</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground/80 mb-1">Resumo:</h4>
              <p className="text-sm text-foreground/70 p-3 bg-muted rounded-md leading-relaxed">
                {analysisResult.summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
