// src/app/admin/student-management/edit/[id]/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define a type for student data (this would come from a database in a real app)
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  address?: string;
  birthDate?: string;
  plan: string;
  planExpiration: string;
  status: 'active' | 'inactive' | 'pending';
  lastPaymentDate: string; // Not directly edited here, but useful for context
}

const editStudentFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "E-mail inválido." }),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, { message: "Formato de telefone inválido. Use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX." }).optional().or(z.literal('')),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "Formato de CPF inválido. Use XXX.XXX.XXX-XX." }).optional().or(z.literal('')),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  plan: z.string().min(1, { message: "Selecione um plano." }),
  planExpiration: z.string().min(1, { message: "Data de vencimento do plano é obrigatória." }),
  status: z.enum(['active', 'inactive', 'pending'], { message: "Selecione um status." }),
});

// Sample student data (same as in student-management/page.tsx, for demonstration)
const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    phone: '(32) 99123-4567',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123, Centro, São Paulo',
    birthDate: '1990-01-01',
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
    cpf: '987.654.321-00',
    address: 'Avenida Central, 456, Centro, Rio de Janeiro',
    birthDate: '1985-07-15',
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
    cpf: '456.789.123-45',
    address: 'Rua Nova, 789, Centro, Belo Horizonte',
    birthDate: '1992-03-15',
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

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const form = useForm<z.infer<typeof editStudentFormSchema>>({
    resolver: zodResolver(editStudentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      address: '',
      birthDate: '',
      plan: '',
      planExpiration: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    // In a real application, fetch student data from a database using the ID
    const foundStudent = sampleStudents.find(s => s.id === id);
    if (foundStudent) {
      setStudent(foundStudent);
      form.reset({
        name: foundStudent.name,
        email: foundStudent.email,
        phone: foundStudent.phone,
        cpf: foundStudent.cpf,
        address: foundStudent.address,
        birthDate: foundStudent.birthDate,
        plan: foundStudent.plan,
        planExpiration: foundStudent.planExpiration,
        status: foundStudent.status,
      });
    } else {
      toast({
        title: "Aluno não encontrado",
        description: "O aluno com o ID especificado não foi encontrado.",
        variant: "destructive",
      });
      router.push('/admin/student-management');
    }
    setLoadingStudent(false);
  }, [id, form, router, toast]);

  async function onSubmit(values: z.infer<typeof editStudentFormSchema>) {
    console.log("Updated student data for ID:", id, values);
    // Simulate API call to update student
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Aluno Atualizado!",
      description: `As informações de ${values.name} foram salvas com sucesso.`,
    });
    router.push('/admin/student-management');
  }

  if (loadingStudent) {
    return (
      <MainLayout className="flex justify-center items-center h-[calc(100vh-128px)]">
        <p>Carregando dados do aluno...</p>
      </MainLayout>
    );
  }

  if (!student) {
    return null; // Should redirect before this, but as a fallback
  }

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/admin/student-management"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <UserCog className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Editar Aluno: {student.name}
            </h1>
          </div>
        </div>
        <p className="text-lg text-foreground/80 mb-10 max-w-3xl">
          Atualize as informações do aluno.
        </p>

        <Card className="shadow-lg max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Dados do Aluno</CardTitle>
            <CardDescription>Edite os campos necessários.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do aluno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="XXX.XXX.XXX-XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, bairro, cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Formato: DD/MM/AAAA</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano Ativo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mensal">Mensal</SelectItem>
                            <SelectItem value="Trimestral">Trimestral</SelectItem>
                            <SelectItem value="Anual">Anual</SelectItem>
                            <SelectItem value="Experimental">Experimental</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="planExpiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vencimento do Plano</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}