
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, HeartPulse, Users, Zap } from 'lucide-react';

const benefits = [
  {
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    title: 'Saúde e Bem-Estar',
    description: 'Melhore sua qualidade de vida, fortaleça seu corpo e aumente sua energia.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Equipe Qualificada',
    description: 'Profissionais dedicados para te auxiliar em cada etapa do seu treino.',
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: 'Equipamentos Modernos',
    description: 'Aparelhos de última geração para garantir o melhor desempenho e segurança.',
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-primary" />,
    title: 'Resultados Comprovados',
    description: 'Alcance seus objetivos de forma eficiente com nosso acompanhamento personalizado.',
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
            Por que escolher a <span className="text-primary">Corpo em Ação</span>?
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            Descubra os diferenciais que fazem da nossa academia o lugar ideal para você.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-primary/20 transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader className="items-center">
                {benefit.icon}
                <CardTitle className="font-headline mt-4 text-xl text-foreground">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
