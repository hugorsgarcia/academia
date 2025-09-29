// src/app/admin/student-management/payments/[id]/page.tsx
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
  dueDate: string;
}

// Sample payment data (in a real app, this would be fetched from a database)
const samplePayments: Payment[] = [
  { id: 'pay_001', date: '2025-05-20', amount: 129.00, status: 'paid', method: 'Cartão de Crédito', dueDate: '2025-05-20' },
  { id: 'pay_002', date: '2025-04-20', amount: 129.00, status: 'paid', method: 'PIX', dueDate: '2025-04-20' },
  { id: 'pay_003', date: '2025-03-20', amount: 129.00, status: 'paid', method: 'Boleto', dueDate: '2025-03-20' },
  { id: 'pay_004', date: '2025-06-20', amount: 129.00, status: 'pending', method: 'Boleto', dueDate: '2025-06-20' },
  { id: 'pay_005', date: '2025-02-20', amount: 129.00, status: 'overdue', method: 'Cartão de Crédito', dueDate: '2025-02-20' },
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

export default function StudentPaymentsPage({ params }: { params: { id: string } }) {
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

  const getPaymentStatusVariant = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/admin/student-management"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Histórico de Pagamentos de {student.name}
            </h1>
          </div>
        </div>
        <p className="text-lg text-foreground/80 mb-10 max-w-3xl">
          Visualize todos os pagamentos realizados e pendentes de {student.name}.
        </p>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Transações</CardTitle>
            <CardDescription>Detalhes dos pagamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da Transação</TableHead>
                  <TableHead>Data do Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Vencimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samplePayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-foreground/70">
                      Nenhum pagamento encontrado para este aluno.
                    </TableCell>
                  </TableRow>
                ) : (
                  samplePayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>R${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusVariant(payment.status)}>
                          {getPaymentStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
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