
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye, Heart } from 'lucide-react';

export default function SobreNosPage() {
  const teamMembers = [
    { name: "João Silva", role: "Head Coach", image: "https://placehold.co/300x300.png", imageHint: "male fitness coach" },
    { name: "Maria Oliveira", role: "Pilates Instructor", image: "https://placehold.co/300x300.png", imageHint: "female pilates instructor" },
    { name: "Carlos Santos", role: "Personal Trainer", image: "https://placehold.co/300x300.png", imageHint: "male personal trainer" },
  ];

  return (
    <MainLayout>
      <section className="text-center py-12 md:py-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Sobre a Corpo em Ação</h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Conheça nossa história, paixão pelo bem-estar e o que nos move a ser a melhor academia de Cataguases.
        </p>
      </section>

      <section className="py-12">
        <h2 className="font-headline text-3xl font-bold text-center mb-10">Nossa História</h2>
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Fachada da academia Corpo em Ação" 
                layout="fill"
                objectFit="cover"
                data-ai-hint="gym exterior"
              />
            </div>
            <div className="space-y-4">
              <p className="text-foreground/70 leading-relaxed">
                Fundada em [Ano de Fundação], a Academia Corpo em Ação nasceu do sonho de criar um espaço em Cataguases onde as pessoas pudessem transformar suas vidas através da atividade física, saúde e bem-estar. Desde o início, nosso foco tem sido oferecer um ambiente acolhedor, equipamentos de alta qualidade e uma equipe de profissionais apaixonados e dedicados.
              </p>
              <p className="text-foreground/70 leading-relaxed">
                Ao longo dos anos, crescemos e evoluímos, sempre buscando as últimas tendências e inovações no mundo fitness para proporcionar a melhor experiência aos nossos alunos. Acreditamos que cada pessoa é única, e por isso, oferecemos uma variedade de modalidades e um acompanhamento personalizado para ajudar cada um a alcançar seus objetivos.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="py-12 grid md:grid-cols-3 gap-8">
        <Card className="text-center shadow-md hover:shadow-primary/20 transition-shadow">
          <CardHeader className="items-center">
            <Target className="w-12 h-12 text-primary mb-2" />
            <CardTitle className="font-headline text-2xl">Missão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">Promover saúde e qualidade de vida, oferecendo treinos eficazes e um ambiente motivador para todos.</p>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-primary/20 transition-shadow">
          <CardHeader className="items-center">
            <Eye className="w-12 h-12 text-primary mb-2" />
            <CardTitle className="font-headline text-2xl">Visão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">Ser referência em bem-estar e performance física em Cataguases, inspirando hábitos saudáveis.</p>
          </CardContent>
        </Card>
        <Card className="text-center shadow-md hover:shadow-primary/20 transition-shadow">
          <CardHeader className="items-center">
            <Heart className="w-12 h-12 text-primary mb-2" />
            <CardTitle className="font-headline text-2xl">Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">Compromisso, Respeito, Excelência, Paixão por Pessoas, Inovação.</p>
          </CardContent>
        </Card>
      </section>

      <section className="py-12">
        <h2 className="font-headline text-3xl font-bold text-center mb-10">Nossa Equipe</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.name} className="text-center overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow">
              <div className="relative w-full h-60">
                <Image src={member.image} alt={member.name} layout="fill" objectFit="cover" data-ai-hint={member.imageHint}/>
              </div>
              <CardContent className="p-6">
                <h3 className="font-headline text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

       <section className="py-12">
        <h2 className="font-headline text-3xl font-bold text-center mb-10">Nossa Estrutura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
            <Image src="https://placehold.co/600x400.png" alt="Área de musculação" layout="fill" objectFit="cover" data-ai-hint="gym weights area"/>
            <div className="absolute inset-0 bg-black/30 flex items-end p-4">
              <h3 className="text-white font-headline text-xl">Área de Musculação</h3>
            </div>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
            <Image src="https://placehold.co/600x400.png" alt="Sala de aulas coletivas" layout="fill" objectFit="cover" data-ai-hint="group fitness class"/>
             <div className="absolute inset-0 bg-black/30 flex items-end p-4">
              <h3 className="text-white font-headline text-xl">Salas de Aulas Coletivas</h3>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
