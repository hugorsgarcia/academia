
"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Ana Silva',
    avatar: 'https://placehold.co/100x100.png',
    avatarFallback: 'AS',
    text: 'A Academia Corpo em Ação mudou minha vida! Profissionais atenciosos e ambiente incrível.',
    rating: 5,
    imageHint: "woman smiling"
  },
  {
    name: 'Carlos Pereira',
    avatar: 'https://placehold.co/100x100.png',
    avatarFallback: 'CP',
    text: 'Equipamentos de ponta e aulas dinâmicas. Recomendo a todos de Cataguases!',
    rating: 5,
    imageHint: "man gym"
  },
  {
    name: 'Juliana Costa',
    avatar: 'https://placehold.co/100x100.png',
    avatarFallback: 'JC',
    text: 'Finalmente encontrei uma academia que me motiva de verdade. Os resultados são visíveis!',
    rating: 4,
    imageHint: "woman fitness"
  },
    {
    name: 'Ricardo Alves',
    avatar: 'https://placehold.co/100x100.png',
    avatarFallback: 'RA',
    text: 'Excelente estrutura e planos acessíveis. A melhor da região sem dúvidas.',
    rating: 5,
    imageHint: "man portrait"
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-secondary/50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
            O que nossos <span className="text-primary">alunos dizem</span>
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            Histórias reais de quem transformou o corpo e a mente conosco.
          </p>
        </div>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
          }}
          className="pb-12"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <Card className="h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.imageHint} />
                    <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-headline text-xl font-semibold text-foreground">{testimonial.name}</h3>
                  <div className="flex my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground/70 leading-relaxed">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
