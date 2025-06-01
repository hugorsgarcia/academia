
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">
          Pronto para transformar sua vida?
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
          Junte-se à Academia Corpo em Ação e dê o primeiro passo rumo aos seus objetivos. 
          Oferecemos planos flexíveis e um ambiente motivador para você alcançar o seu melhor.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button asChild size="lg" variant="secondary" className="shadow-lg hover:shadow-black/20 transition-shadow duration-300">
            <Link href="/planos">Ver Planos</Link>
          </Button>
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 shadow-lg hover:shadow-black/20 transition-shadow duration-300">
            <Link href="/contato">Fale Conosco</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
