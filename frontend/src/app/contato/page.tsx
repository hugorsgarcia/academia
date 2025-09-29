
import { MainLayout } from '@/components/layout/MainLayout';
import { ContactForm } from '@/components/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from 'lucide-react';
import Image from 'next/image';

export default function ContatoPage() {
  return (
    <MainLayout>
      <section className="text-center py-12 md:py-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Entre em Contato</h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Tem dúvidas, sugestões ou quer agendar uma visita? Fale conosco! Estamos prontos para te atender.
        </p>
      </section>

      <section className="py-12 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="font-headline text-3xl font-bold text-foreground mb-6">Envie uma Mensagem</h2>
          <ContactForm />
        </div>

        <div className="space-y-8">
          <h2 className="font-headline text-3xl font-bold text-foreground mb-6">Nossas Informações</h2>
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Endereço</h3>
                  <p className="text-foreground/70">Rua Principal, 123 - Centro, Cataguases - MG, CEP 36770-000</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Telefone / WhatsApp</h3>
                  <p className="text-foreground/70">(32) 99999-8888</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">E-mail</h3>
                  <p className="text-foreground/70">contato@corpoemacao.com.br</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Horários de Funcionamento</h3>
                  <p className="text-foreground/70">Segunda a Sexta: 06:00 - 22:00</p>
                  <p className="text-foreground/70">Sábados: 08:00 - 14:00</p>
                  <p className="text-foreground/70">Domingos e Feriados: Fechado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h3 className="font-headline text-2xl font-semibold text-foreground mb-3">Siga-nos</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-foreground/70 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"><Facebook className="h-7 w-7" /></a>
              <a href="#" aria-label="Instagram" className="text-foreground/70 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"><Instagram className="h-7 w-7" /></a>
              <a href="#" aria-label="Youtube" className="text-foreground/70 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"><Youtube className="h-7 w-7" /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-headline text-3xl font-bold text-center mb-8">Nossa Localização</h2>
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl border border-border">
          {/* Placeholder for Google Maps. In a real app, use @vis.gl/react-google-maps or an iframe */}
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt="Mapa da localização da academia" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="city map"
          />
        </div>
      </section>
    </MainLayout>
  );
}
