"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Dumbbell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Sobre Nós', href: '/sobre-nos' },
  { label: 'Modalidades', href: '/modalidades' },
  { label: 'Planos', href: '/planos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleAuthAction = () => {
    if (isAuthenticated && user) {
      // If user is authenticated, go to their dashboard
      if (user.role === 'student') {
        window.location.href = '/aluno';
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } else {
      // If not authenticated, go to login
      window.location.href = '/aluno/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl font-bold text-primary">Corpo em Ação</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/70 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-foreground/70">
                Olá, {user.name}
              </span>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleAuthAction}
              >
                <User className="h-4 w-4 mr-2" />
                {user.role === 'student' ? 'Meu Painel' : 'Dashboard'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              onClick={handleAuthAction}
            >
              Área do Aluno
            </Button>
          )}
        </nav>

        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6">
              <div className="flex flex-col space-y-6">
                <Link href="/" className="flex items-center space-x-2 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Dumbbell className="h-8 w-8 text-primary" />
                  <span className="font-headline text-xl font-bold text-primary">Corpo em Ação</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {isAuthenticated && user ? (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <p className="text-sm text-foreground/70">
                      Olá, {user.name}
                    </p>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        handleAuthAction();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user.role === 'student' ? 'Meu Painel' : 'Dashboard'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full mt-4"
                    onClick={() => {
                      handleAuthAction();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Área do Aluno
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}