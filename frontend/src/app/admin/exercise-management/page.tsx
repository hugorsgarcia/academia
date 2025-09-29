'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutGeneratorForm } from '@/components/WorkoutGeneratorForm';
import { getExerciseAssistance, type ExerciseAssistantOutput } from '@/ai/flows/exercise-assistant';
import { useToast } from '@/hooks/use-toast';
import { 
  Dumbbell, 
  MessageCircle, 
  Send, 
  Loader2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for existing exercises
const mockExercises = [
  {
    id: 1,
    name: 'Supino Reto',
    category: 'Peito',
    difficulty: 'Intermediário',
    equipment: ['Barra', 'Banco'],
    primaryMuscles: ['Peitoral'],
    description: 'Exercício fundamental para desenvolvimento do peitoral.',
  },
  {
    id: 2,
    name: 'Agachamento',
    category: 'Pernas',
    difficulty: 'Iniciante',
    equipment: ['Peso Corporal'],
    primaryMuscles: ['Quadríceps', 'Glúteos'],
    description: 'Movimento básico para fortalecimento das pernas.',
  },
  {
    id: 3,
    name: 'Deadlift',
    category: 'Costas',
    difficulty: 'Avançado',
    equipment: ['Barra', 'Anilhas'],
    primaryMuscles: ['Posterior de Coxa', 'Glúteos', 'Lombar'],
    description: 'Exercício complexo para desenvolvimento da cadeia posterior.',
  },
];

export default function ExerciseManagementPage() {
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    exerciseDetails?: ExerciseAssistantOutput['response']['exerciseDetails'];
  }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const filteredExercises = mockExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || exercise.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getExerciseAssistance({
        query: userMessage,
        userLevel: 'intermediate', // This could come from user profile
      });

      setChatMessages(prev => [...prev, { 
        type: 'assistant', 
        content: response.response.answer,
        exerciseDetails: response.response.exerciseDetails
      }]);
    } catch (error) {
      console.error('Erro ao obter assistência:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível obter uma resposta. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-4">
            <Dumbbell className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
            Gerenciamento de Exercícios
          </h1>
          <p className="mt-3 text-lg text-foreground/80 max-w-2xl mx-auto">
            Gerencie exercícios, crie treinos personalizados e obtenha assistência com IA.
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generator">Gerador de Treinos</TabsTrigger>
            <TabsTrigger value="exercises">Exercícios</TabsTrigger>
            <TabsTrigger value="assistant">Assistente IA</TabsTrigger>
            <TabsTrigger value="create">Criar Exercício</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerador de Treinos Personalizados</CardTitle>
                <p className="text-foreground/70">
                  Crie treinos personalizados baseados no perfil e objetivos do aluno.
                </p>
              </CardHeader>
              <CardContent>
                <WorkoutGeneratorForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Exercícios</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar exercícios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="Peito">Peito</SelectItem>
                      <SelectItem value="Costas">Costas</SelectItem>
                      <SelectItem value="Pernas">Pernas</SelectItem>
                      <SelectItem value="Ombros">Ombros</SelectItem>
                      <SelectItem value="Braços">Braços</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as dificuldades</SelectItem>
                      <SelectItem value="Iniciante">Iniciante</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExercises.map((exercise) => (
                    <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="w-fit">
                          {exercise.category}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-foreground/70">{exercise.description}</p>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Músculos Primários:</h4>
                          <div className="flex flex-wrap gap-1">
                            {exercise.primaryMuscles.map((muscle, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Equipamentos:</h4>
                          <div className="flex flex-wrap gap-1">
                            {exercise.equipment.map((eq, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Editar
                          </Button>
                          <Button size="sm" variant="secondary" className="flex-1">
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredExercises.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-foreground/60">Nenhum exercício encontrado com os filtros selecionados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assistant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Assistente de Exercícios IA
                </CardTitle>
                <p className="text-foreground/70">
                  Faça perguntas sobre exercícios, técnicas, forma correta e alternativas.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-lg p-4 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-foreground/60 py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Comece uma conversa! Pergunte sobre exercícios, técnicas ou peça sugestões.</p>
                        <div className="mt-4 text-sm space-y-1">
                          <p><strong>Exemplos:</strong></p>
                          <p>"Como fazer supino corretamente?"</p>
                          <p>"Alternativas para agachamento sem equipamento"</p>
                          <p>"Exercícios para fortalecer o core"</p>
                        </div>
                      </div>
                    )}
                    
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          
                          {message.exerciseDetails && (
                            <div className="mt-3 space-y-2 border-t pt-3">
                              <div>
                                <h4 className="font-medium text-sm">Músculos Primários:</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {message.exerciseDetails.primaryMuscles.map((muscle, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {muscle}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {message.exerciseDetails.commonMistakes.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm">Erros Comuns:</h4>
                                  <ul className="text-xs space-y-1 mt-1">
                                    {message.exerciseDetails.commonMistakes.slice(0, 3).map((mistake, i) => (
                                      <li key={i}>• {mistake}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Faça sua pergunta sobre exercícios..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isLoading || !currentMessage.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Novo Exercício
                </CardTitle>
                <p className="text-foreground/70">
                  Adicione um novo exercício à biblioteca da academia.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Plus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Formulário de Criação de Exercícios</h3>
                  <p className="text-foreground/60 mb-6">
                    Esta funcionalidade será implementada em breve. Por enquanto, use o assistente IA para obter informações sobre exercícios.
                  </p>
                  <Button variant="outline" disabled>
                    Em Desenvolvimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
}