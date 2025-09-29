
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/40 to-background text-foreground py-20 md:py-32">
      <div className="absolute inset-0 opacity-5">
         {/* You can add a subtle background pattern or image here if desired */}
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Seu Corpo <span className="text-primary">em Ação</span>.
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            A melhor em Cataguases! Qualidade de vida é aqui. Transforme sua rotina e alcance seus objetivos com a gente.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="shadow-lg hover:shadow-primary/40 transition-shadow duration-300">
              <Link href="/register">Criar Conta</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-accent/30 transition-shadow duration-300">
              <Link href="/login">Fazer Login</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="shadow-lg hover:shadow-accent/30 transition-shadow duration-300">
              <Link href="/planos">Ver Planos</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <Image
            src="https://placehold.co/800x600.png"
            alt="Academia moderna e bem equipada"
            layout="fill"
            objectFit="cover"
            className="transform hover:scale-105 transition-transform duration-500"
            data-ai-hint="gym interior"
          />
        </div>
      </div>
    </section>
  );
}
