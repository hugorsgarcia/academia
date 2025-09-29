
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const sampleTimetable = [
  { day: 'Segunda-feira', time: '18:00 - 19:00', activity: 'Musculação (Treino A)', instructor: 'Carlos Santos' },
  { day: 'Terça-feira', time: '19:00 - 20:00', activity: 'Spinning', instructor: 'Ana Silva' },
  { day: 'Quarta-feira', time: '18:00 - 19:00', activity: 'Musculação (Treino B)', instructor: 'Carlos Santos' },
  { day: 'Quinta-feira', time: '07:00 - 08:00', activity: 'Yoga', instructor: 'Juliana Costa' },
  { day: 'Sexta-feira', time: '18:00 - 19:00', activity: 'Musculação (Treino C)', instructor: 'Carlos Santos' },
  { day: 'Sábado', time: '10:00 - 11:00', activity: 'Treinamento Funcional', instructor: 'Ricardo Alves' },
];

export default function HorariosPage() {
  // This page should be protected and only accessible after login.
  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/aluno/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">Meus Horários</h1>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Sua Agenda de Treinos</CardTitle>
            <CardDescription>Confira suas aulas e treinos programados para esta semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] font-semibold">Dia</TableHead>
                  <TableHead className="w-[150px] font-semibold">Horário</TableHead>
                  <TableHead className="font-semibold">Atividade</TableHead>
                  <TableHead className="font-semibold">Instrutor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTimetable.map((item) => (
                  <TableRow key={`${item.day}-${item.time}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.day}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.activity}</TableCell>
                    <TableCell>{item.instructor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {sampleTimetable.length === 0 && (
              <p className="text-center py-8 text-foreground/70">
                Você ainda não possui atividades agendadas. Fale com um instrutor para montar seu treino!
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-10 text-center">
            <Button asChild>
                <Link href="/modalidades">Explorar Mais Aulas</Link>
            </Button>
        </div>
      </section>
    </MainLayout>
  );
}
