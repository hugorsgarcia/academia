"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { User, Calendar, CreditCard, Dumbbell, Target, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface StudentProfile {
  id: number;
  user_id: number;
  registration_number: string;
  cpf: string;
  birth_date: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  medical_conditions: string;
  fitness_goals: string;
  status: string;
  enrollment_date: string;
  body_measurements: any;
  preferences: any;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

interface Payment {
  id: number;
  amount: number;
  status: string;
  payment_method: string;
  due_date: string;
  paid_date: string;
  description: string;
  created_at: string;
}

interface Workout {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  duration_minutes: number;
  target_muscle_groups: string[];
  equipment_needed: string[];
  instructions: string;
  created_at: string;
}

function StudentDashboard() {
  const { user, token, logout } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      fetchStudentData();
    }
  }, [user, token]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student profile
      const profileResponse = await fetch(`http://localhost:3002/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Erro ao carregar perfil do aluno');
      }

      const profileData = await profileResponse.json();
      console.log('Profile data:', profileData); // Debug
      
      // Se temos o student_id do perfil, buscar dados completos do estudante
      if (profileData.data.student_id) {
        const studentResponse = await fetch(`http://localhost:3002/api/students/${profileData.data.student_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          console.log('Student data:', studentData); // Debug
          setStudentProfile(studentData.data);
        }
      }

      // Fetch payments - usar try/catch para não quebrar se não houver endpoint
      try {
        const paymentsResponse = await fetch(`http://localhost:3002/api/payments/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.data || []);
        }
      } catch (paymentError) {
        console.log('Payments endpoint not available:', paymentError);
        setPayments([]);
      }

      // Fetch workouts - usar try/catch para não quebrar se não houver endpoint
      try {
        const workoutsResponse = await fetch(`http://localhost:3002/api/workouts/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          setWorkouts(workoutsData.data || []);
        }
      } catch (workoutError) {
        console.log('Workouts endpoint not available:', workoutError);
        setWorkouts([]);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do aluno...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchStudentData} className="w-full">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Academia Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, <span className="font-medium">{user?.name}</span>
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Olá, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Bem-vindo ao seu dashboard pessoal. Aqui você pode acompanhar seu progresso, treinos e pagamentos.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center mt-1">
                    <Badge className={getStatusBadgeColor(studentProfile?.status || 'pending')}>
                      {studentProfile?.status === 'active' ? 'Ativo' :
                       studentProfile?.status === 'inactive' ? 'Inativo' :
                       studentProfile?.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Dumbbell className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Treinos</p>
                  <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'pending' || p.status === 'overdue').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membro desde</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {studentProfile?.enrollment_date ? formatDate(studentProfile.enrollment_date) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="workouts">Treinos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="goals">Objetivos</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                      <p className="text-gray-900">{studentProfile?.user?.name || user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {studentProfile?.user?.email || user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {studentProfile?.phone || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                      <p className="text-gray-900">
                        {studentProfile?.birth_date ? formatDate(studentProfile.birth_date) : 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço</label>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {studentProfile?.address || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Número de Matrícula</label>
                    <p className="text-gray-900 font-mono">
                      {studentProfile?.registration_number || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome</label>
                    <p className="text-gray-900">
                      {studentProfile?.emergency_contact_name || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {studentProfile?.emergency_contact_phone || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Condições Médicas</label>
                    <p className="text-gray-900">
                      {studentProfile?.medical_conditions || 'Nenhuma condição médica informada'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Meus Treinos ({workouts.length})
                </CardTitle>
                <CardDescription>
                  Seus treinos personalizados e programas de exercícios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum treino encontrado</p>
                    <p className="text-sm text-gray-500">Entre em contato com seu instrutor para criar um programa de treinos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workouts.map((workout) => (
                      <Card key={workout.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{workout.name}</CardTitle>
                            <Badge className={getDifficultyBadgeColor(workout.difficulty)}>
                              {workout.difficulty === 'beginner' ? 'Iniciante' :
                               workout.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 mb-3">{workout.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{workout.duration_minutes} minutos</span>
                            </div>
                            {workout.target_muscle_groups && workout.target_muscle_groups.length > 0 && (
                              <div className="flex items-center">
                                <Target className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{workout.target_muscle_groups.join(', ')}</span>
                              </div>
                            )}
                          </div>
                          {workout.instructions && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{workout.instructions}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Histórico de Pagamentos ({payments.length})
                </CardTitle>
                <CardDescription>
                  Acompanhe seus pagamentos e mensalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pagamento encontrado</p>
                    <p className="text-sm text-gray-500">Seus pagamentos aparecerão aqui quando forem registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <Card key={payment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {payment.description || 'Mensalidade'}
                                </h4>
                                <Badge className={getPaymentStatusBadgeColor(payment.status)}>
                                  {payment.status === 'paid' ? 'Pago' :
                                   payment.status === 'pending' ? 'Pendente' :
                                   payment.status === 'overdue' ? 'Vencido' : payment.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Valor:</span>
                                  <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Vencimento:</span>
                                  <p className="font-medium">{formatDate(payment.due_date)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Método:</span>
                                  <p className="font-medium">
                                    {payment.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                                     payment.payment_method === 'debit_card' ? 'Cartão de Débito' :
                                     payment.payment_method === 'pix' ? 'PIX' :
                                     payment.payment_method === 'bank_transfer' ? 'Transferência' :
                                     payment.payment_method === 'cash' ? 'Dinheiro' : 'Boleto'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Criado em:</span>
                                  <p className="font-medium">{formatDate(payment.created_at)}</p>
                                </div>
                              </div>
                              {payment.paid_date && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-600">Pago em:</span>
                                  <span className="font-medium text-green-600 ml-1">
                                    {formatDate(payment.paid_date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Objetivos de Fitness
                </CardTitle>
                <CardDescription>
                  Seus objetivos e metas na academia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Objetivos Definidos</label>
                    <p className="text-gray-900 mt-1">
                      {studentProfile?.fitness_goals || 'Nenhum objetivo definido ainda'}
                    </p>
                  </div>
                  
                  {studentProfile?.body_measurements && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medidas Corporais</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-700">
                          {JSON.stringify(studentProfile.body_measurements, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {studentProfile?.preferences && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Preferências</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-700">
                          {JSON.stringify(studentProfile.preferences, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Dica:</strong> Entre em contato com seu instrutor para definir objetivos específicos 
                      e acompanhar seu progresso de forma mais detalhada.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StudentDashboardPage() {
  return (
    <ProtectedRoute requiredUserType={['student']} redirectTo="/login">
      <StudentDashboard />
    </ProtectedRoute>
  );
}

export default StudentDashboardPage;