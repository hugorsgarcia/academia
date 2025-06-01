
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Dumbbell } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-bold text-primary">Corpo em Ação</span>
            </Link>
            <p className="text-sm text-foreground/70">
              A melhor em Cataguases! Qualidade de vida é aqui. Seu corpo em ação.
            </p>
          </div>
          
          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre-nos" className="text-foreground/70 hover:text-primary">Sobre Nós</Link></li>
              <li><Link href="/modalidades" className="text-foreground/70 hover:text-primary">Modalidades</Link></li>
              <li><Link href="/planos" className="text-foreground/70 hover:text-primary">Planos</Link></li>
              <li><Link href="/contato" className="text-foreground/70 hover:text-primary">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline text-lg font-semibold text-foreground mb-3">Siga-nos</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-foreground/70 hover:text-primary">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-foreground/70 hover:text-primary">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Youtube" className="text-foreground/70 hover:text-primary">
                <Youtube className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-foreground/70 hover:text-primary">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-foreground/60">
          <p>&copy; {currentYear} Academia Corpo em Ação. Todos os direitos reservados.</p>
          <p className="mt-1">Desenvolvido com <span className="text-primary">&hearts;</span> por Firebase Studio</p>
        </div>
      </div>
    </footer>
  );
}
