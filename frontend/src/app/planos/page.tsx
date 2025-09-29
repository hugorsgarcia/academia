
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Plano Mensal',
    price: 'R$129',
    period: '/mês',
    features: [
      'Acesso a todas as modalidades',
      'Musculação livre',
      'Aulas coletivas inclusas',
      'Sem taxa de matrícula',
    ],
    popular: false,
    cta: 'Fazer Matrícula',
    ctaLink: '/contato?plano=mensal'
  },
  {
    name: 'Plano Trimestral',
    price: 'R$109',
    period: '/mês',
    originalPrice: 'R$387',
    billedAs: 'Cobrado R$327 a cada 3 meses',
    features: [
      'Todos os benefícios do Plano Mensal',
      'Desconto progressivo',
      'Avaliação física inclusa',
      'Acompanhamento básico',
    ],
    popular: true,
    cta: 'Fazer Matrícula',
    ctaLink: '/contato?plano=trimestral'
  },
  {
    name: 'Plano Anual',
    price: 'R$89',
    period: '/mês',
    originalPrice: 'R$1548',
    billedAs: 'Cobrado R$1068 por ano',
    features: [
      'Todos os benefícios do Plano Trimestral',
      'Maior desconto',
      'Acesso VIP a eventos',
      '2 avaliações físicas anuais',
    ],
    popular: false,
    cta: 'Fazer Matrícula',
    ctaLink: '/contato?plano=anual'
  },
];

export default function PlanosPage() {
  return (
    <MainLayout>
      <section className="text-center py-12 md:py-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Planos e Preços</h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Escolha o plano ideal para você e comece sua jornada de transformação na Academia Corpo em Ação.
        </p>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col shadow-lg hover:shadow-primary/20 transition-shadow duration-300 ${plan.popular ? 'border-2 border-primary relative ring-4 ring-primary/30' : 'border-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                  Mais Popular
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="font-headline text-2xl md:text-3xl text-foreground">{plan.name}</CardTitle>
                <div className="my-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-foreground/70">{plan.period}</span>
                </div>
                {plan.billedAs && <CardDescription className="text-xs text-foreground/60">{plan.billedAs}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pb-8 justify-center">
                <Button asChild size="lg" className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  <Link href={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
            <p className="text-foreground/70 mb-4">Dúvidas sobre os planos? Quer uma condição especial?</p>
            <Button asChild size="lg">
                <Link href="/contato">Agende uma Visita</Link>
            </Button>
        </div>
      </section>
    </MainLayout>
  );
}
