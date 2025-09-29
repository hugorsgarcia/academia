
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Bike, Activity, Zap, Shield, Leaf, Users, Weight } from 'lucide-react';
import Link from 'next/link';

const modalities = [
  {
    name: 'Musculação',
    icon: <Dumbbell className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'weights gym equipment',
    description: 'Fortaleça seus músculos, defina seu corpo e aumente sua resistência com treinos personalizados e equipamentos modernos.',
  },
  {
    name: 'Pilates',
    icon: <Activity className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'pilates studio reformer',
    description: 'Melhore sua postura, flexibilidade e consciência corporal com exercícios que trabalham corpo e mente.',
  },
  {
    name: 'Spinning',
    icon: <Bike className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'spinning class bikes',
    description: 'Queime calorias e aumente sua capacidade cardiorrespiratória em aulas de bike indoor super animadas e desafiadoras.',
  },
  {
    name: 'Treinamento Funcional',
    icon: <Zap className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'functional training outdoor',
    description: 'Desenvolva força, equilíbrio, agilidade e coordenação com exercícios que simulam movimentos do dia a dia.',
  },
  {
    name: 'Lutas (Boxe/Muay Thai)',
    icon: <Shield className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'boxing gloves ring',
    description: 'Aprenda técnicas de defesa pessoal, melhore seu condicionamento físico e alivie o estresse com nossas aulas de lutas.',
  },
  {
    name: 'Yoga',
    icon: <Leaf className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'yoga class meditation',
    description: 'Encontre equilíbrio, paz interior e flexibilidade através de posturas, respiração e meditação.',
  },
  {
    name: 'Aulas Coletivas',
    icon: <Users className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'group fitness aerobics',
    description: 'Participe de aulas vibrantes como Zumba, Step, Jump e muito mais. Diversão e resultado garantidos!',
  },
  {
    name: 'Cross Training',
    icon: <Weight className="w-10 h-10 text-primary" />,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'crossfit box workout',
    description: 'Desafie seus limites com treinos de alta intensidade que combinam levantamento de peso, ginástica e cardio.',
  },
];

export default function ModalidadesPage() {
  return (
    <MainLayout>
      <section className="text-center py-12 md:py-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Nossas Modalidades</h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Encontre a atividade perfeita para você na Academia Corpo em Ação. Oferecemos uma ampla variedade de aulas para todos os gostos e objetivos.
        </p>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modalities.map((modality) => (
            <Card key={modality.name} className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out transform hover:scale-105">
              <div className="relative w-full h-56">
                <Image
                  src={modality.image}
                  alt={modality.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={modality.imageHint}
                />
              </div>
              <CardHeader className="items-center text-center pt-6">
                {modality.icon}
                <CardTitle className="font-headline mt-3 text-2xl text-foreground">{modality.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-center text-foreground/70 leading-relaxed">
                  {modality.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="justify-center pb-6">
                <Button asChild variant="default">
                  <Link href="/contato">Saiba Mais</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
