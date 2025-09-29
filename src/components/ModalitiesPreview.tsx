
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Bike, Activity, Zap, Shield, Leaf } from 'lucide-react';

const modalities = [
  { name: 'Musculação', icon: <Dumbbell className="w-8 h-8 text-primary" />, image: 'https://placehold.co/400x300.png', imageHint: 'weights gym' },
  { name: 'Pilates', icon: <Activity className="w-8 h-8 text-primary" />, image: 'https://placehold.co/400x300.png', imageHint: 'pilates class' },
  { name: 'Spinning', icon: <Bike className="w-8 h-8 text-primary" />, image: 'https://placehold.co/400x300.png', imageHint: 'spinning bikes' },
];

export function ModalitiesPreview() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
            Nossas <span className="text-primary">Modalidades</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            Encontre a atividade perfeita para você e comece sua jornada de transformação.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modalities.map((modality, index) => (
            <Card key={modality.name} className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
              <CardHeader className="p-0">
                <div className="relative w-full h-48">
                  <Image
                    src={modality.image}
                    alt={modality.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={modality.imageHint}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">{modality.icon}</div>
                <CardTitle className="font-headline text-xl text-foreground">{modality.name}</CardTitle>
              </CardContent>
              <CardFooter className="p-6 pt-0 justify-center">
                 {/* Intentionally empty or could add a small description here */}
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/modalidades">Ver Todas Modalidades</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
