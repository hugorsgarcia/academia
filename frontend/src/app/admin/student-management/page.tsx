// src/app/admin/student-management/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Search, ArrowLeft, Upload, DollarSign, MessageSquareText, CalendarDays } from 'lucide-react';
import { Users } from 'lucide-react'; // Moved Users to its own import line
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Define a type for student data (this would come from a database in a real app)
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  planExpiration: string;
  status: 'active' | 'inactive' | 'pending';
  lastPaymentDate: string;
}

// Sample student data
const sampleStudents: Student[] = [
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

export default function StudentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'active', 'inactive', 'pending'

  const filteredStudents = sampleStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: 'active' | 'inactive' | 'pending') => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: 'active' | 'inactive' | 'pending') => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'pending':
        return 'Pendente';
      default:
        return '';
    }
  };

  const simulateWhatsAppMessage = (studentName: string) => {
    alert(`Simulando envio de mensagem de WhatsApp para ${studentName}`);
    // In a real application, you would integrate with a WhatsApp API here
    // e.g., window.open(`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=Olá ${student.name},...`, '_blank');
  };

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Gerenciamento de Alunos
            </h1>
          </div>
        </div>
        <p className="text-lg text-foreground/80 mb-10 max-w-3xl">
          Visualize, cadastre e edite as informações dos alunos, gerencie seus planos e acompanhe pagamentos.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Button asChild>
            <Link href="/admin/student-management/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Novo Aluno
            </Link>
          </Button>
          {/* Future features can be added here, e.g., Bulk Upload */}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Lista de Alunos</CardTitle>
            <CardDescription>Gerencie todos os alunos cadastrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, e-mail ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={filterStatus === 'all' ? 'default' : 'outline'} 
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button 
                  variant={filterStatus === 'active' ? 'default' : 'outline'} 
                  onClick={() => setFilterStatus('active')}
                  size="sm"
                >
                  Ativos
                </Button>
                <Button 
                  variant={filterStatus === 'pending' ? 'default' : 'outline'} 
                  onClick={() => setFilterStatus('pending')}
                  size="sm"
                >
                  Pendentes
                </Button>
                <Button 
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'} 
                  onClick={() => setFilterStatus('inactive')}
                  size="sm"
                >
                  Inativos
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-foreground/70">
                      Nenhum aluno encontrado com os critérios de busca/filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.plan}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(student.status)}>
                          {getStatusText(student.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.planExpiration}</TableCell>
                      <TableCell className="text-right flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/admin/student-management/edit/${student.id}`} title="Editar Aluno">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" title="Ver Detalhes/Ações">
                              <Search className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2">
                            <div className="grid gap-2">
                              <Button variant="ghost" className="justify-start" size="sm" asChild>
                                <Link href={`/admin/student-management/payments/${student.id}`}>
                                  <DollarSign className="mr-2 h-4 w-4" /> Histórico de Pagamentos
                                </Link>
                              </Button>
                              <Button variant="ghost" className="justify-start" size="sm" asChild>
                                <Link href={`/admin/student-management/documents/${student.id}`}>
                                  <Upload className="mr-2 h-4 w-4" /> Documentos
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="justify-start" 
                                size="sm" 
                                onClick={() => simulateWhatsAppMessage(student.name)}
                              >
                                <MessageSquareText className="mr-2 h-4 w-4" /> Enviar WhatsApp
                              </Button>
                              <Button variant="ghost" className="justify-start" size="sm" asChild>
                                <Link href={`/admin/student-management/timetable/${student.id}`}>
                                  <CalendarDays className="mr-2 h-4 w-4" /> Ver Horário
                                </Link>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}