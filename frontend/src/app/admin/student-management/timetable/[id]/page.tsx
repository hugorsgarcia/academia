// src/app/admin/student-management/timetable/[id]/page.tsx
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';

interface TimetableEntry {
  day: string;
  time: string;
  activity: string;
  instructor: string;
}

// Sample timetable data (can be linked to specific student in a real app)
const sampleTimetable: TimetableEntry[] = [
  { day: 'Segunda-feira', time: '18:00 - 19:00', activity: 'Musculação (Treino A)', instructor: 'Carlos Santos' },
  { day: 'Terça-feira', time: '19:00 - 20:00', activity: 'Spinning', instructor: 'Ana Silva' },
  { day: 'Quarta-feira', time: '18:00 - 19:00', activity: 'Musculação (Treino B)', instructor: 'Carlos Santos' },
  { day: 'Quinta-feira', time: '07:00 - 08:00', activity: 'Yoga', instructor: 'Juliana Costa' },
  { day: 'Sexta-feira', time: '18:00 - 19:00', activity: 'Musculação (Treino C)', instructor: 'Carlos Santos' },
  { day: 'Sábado', time: '10:00 - 11:00', activity: 'Treinamento Funcional', instructor: 'Ricardo Alves' },
];

// Sample student data (same as in student-management/page.tsx, for demonstration)
const sampleStudents = [
  {
    id: '1',
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    phone: '(32) 99123-4567',
    plan: 'Anual',
    planExpiration: '2025-12-31',
    status: 'active',
    lastPaymentDate: '2025-05-20',
  },
  {
    id: '2',
    name: 'Maria Souza',
    email: 'maria.souza@example.com',
    phone: '(32) 99234-5678',
    plan: 'Mensal',
    planExpiration: '2025-06-15',
    status: 'pending',
    lastPaymentDate: '2025-05-10',
  },
  {
    id: '3',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@example.com',
    phone: '(32) 99345-6789',
    plan: 'Trimestral',
    planExpiration: '2025-09-30',
    status: 'active',
    lastPaymentDate: '2025-04-25',
  },
  {
    id: '4',
    name: 'Ana Carolina',
    email: 'ana.carol@example.com',
    phone: '(32) 99456-7890',
    plan: 'Mensal',
    planExpiration: '2025-05-01',
    status: 'inactive',
    lastPaymentDate: '2025-04-01',
  },
];


export default function StudentTimetablePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const student = sampleStudents.find(s => s.id === id); // Find student by ID

  if (!student) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h1 className="font-headline text-3xl font-bold">Aluno não encontrado</h1>
          <p className="mt-4 text-lg text-foreground/70">O aluno com o ID {id} não foi encontrado.</p>
          <Button asChild className="mt-8">
            <Link href="/admin/student-management">Voltar à Gestão de Alunos</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/admin/student-management"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <CalendarDays className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Horários de {student.name}
            </h1>
          </div>
        </div>
        <p className="text-lg text-foreground/80 mb-10 max-w-3xl">
          Agenda de treinos e aulas programadas para {student.name}.
        </p>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Agenda de Treinos</CardTitle>
            <CardDescription>Horários semanais do aluno.</CardDescription>
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
                {sampleTimetable.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-foreground/70">
                      Nenhuma atividade agendada para este aluno.
                    </TableCell>
                  </TableRow>
                ) : (
                  sampleTimetable.map((item) => (
                    <TableRow key={`${item.day}-${item.time}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.day}</TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell>{item.activity}</TableCell>
                      <TableCell>{item.instructor}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-10 text-center">
            <Button asChild>
                <Link href="/admin/student-management">Voltar à Gestão de Alunos</Link>
            </Button>
        </div>
      </section>
    </MainLayout>
  );
}