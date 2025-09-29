// src/components/WorkoutGeneratorForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { generateWorkoutPlan, type WorkoutGeneratorOutput } from '@/ai/flows/workout-generator';
import { Loader2, Dumbbell, Calendar, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  age: z.number().min(13, { message: "Idade mínima é 13 anos." }).max(100, { message: "Idade máxima é 100 anos." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Selecione o gênero." }),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], { required_error: "Selecione o nível de condicionamento." }),
  goals: z.array(z.enum(['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_fitness'])).min(1, { message: "Selecione pelo menos um objetivo." }),
  availableDays: z.number().min(1, { message: "Mínimo 1 dia por semana." }).max(7, { message: "Máximo 7 dias por semana." }),
  sessionDuration: z.number().min(15, { message: "Mínimo 15 minutos." }).max(180, { message: "Máximo 180 minutos." }),
  injuries: z.array(z.string()).optional(),
  preferences: z.array(z.enum(['cardio', 'strength', 'functional', 'yoga', 'pilates', 'crossfit'])).optional(),
});

const goalOptions = [
  { value: 'weight_loss', label: 'Perda de Peso' },
  { value: 'muscle_gain', label: 'Ganho de Massa Muscular' },
  { value: 'strength', label: 'Força' },
  { value: 'endurance', label: 'Resistência' },
  { value: 'flexibility', label: 'Flexibilidade' },
  { value: 'general_fitness', label: 'Condicionamento Geral' },
];

const preferenceOptions = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Musculação' },
  { value: 'functional', label: 'Treino Funcional' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
];

export function WorkoutGeneratorForm() {
  const { toast } = useToast();
  const [workoutResult, setWorkoutResult] = useState<WorkoutGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      gender: 'male',
      fitnessLevel: 'beginner',
      goals: [],
      availableDays: 3,
      sessionDuration: 60,
      injuries: [],
      preferences: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setWorkoutResult(null);

    try {
      const result = await generateWorkoutPlan({
        userProfile: values,
      });
      setWorkoutResult(result);
      toast({
        title: "Treino Personalizado Criado!",
        description: "Seu plano de treino foi gerado com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao gerar treino:", err);
      toast({
        variant: "destructive",
        title: "Erro ao Gerar Treino",
        description: "Não foi possível gerar seu plano de treino. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Condicionamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias Disponíveis por Semana</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="7" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração da Sessão (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="15" 
                      max="180" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="goals"
            render={() => (
              <FormItem>
                <FormLabel>Objetivos</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {goalOptions.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name="goals"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value as any)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.value
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferences"
            render={() => (
              <FormItem>
                <FormLabel>Preferências de Treino (Opcional)</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {preferenceOptions.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name="preferences"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value as any)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.value
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Treino Personalizado...
              </>
            ) : (
              <>
                <Dumbbell className="mr-2 h-4 w-4" />
                Gerar Treino Personalizado
              </>
            )}
          </Button>
        </form>
      </Form>

      {workoutResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-6 w-6 text-primary" />
              {workoutResult.workoutPlan.title}
            </CardTitle>
            <p className="text-foreground/70">{workoutResult.workoutPlan.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                {workoutResult.workoutPlan.duration}
              </Badge>
              <Badge variant="outline">
                {workoutResult.workoutPlan.difficulty === 'beginner' && 'Iniciante'}
                {workoutResult.workoutPlan.difficulty === 'intermediate' && 'Intermediário'}
                {workoutResult.workoutPlan.difficulty === 'advanced' && 'Avançado'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="schedule">Cronograma</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
                <TabsTrigger value="progression">Progressão</TabsTrigger>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="space-y-4">
                {workoutResult.workoutPlan.schedule.map((day, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{day.day}</CardTitle>
                        <Badge variant="outline">{day.estimatedDuration}</Badge>
                      </div>
                      <p className="text-sm text-foreground/70">{day.workoutType}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Aquecimento:</h4>
                        <p className="text-sm text-foreground/70">{day.warmUp}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Exercícios:</h4>
                        <div className="space-y-3">
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{exercise.name}</h5>
                                <div className="text-sm text-foreground/60">
                                  {exercise.sets} x {exercise.reps} | Descanso: {exercise.rest}
                                </div>
                              </div>
                              <p className="text-sm text-foreground/70 mb-1">{exercise.instructions}</p>
                              <div className="flex gap-1">
                                {exercise.targetMuscles.map((muscle, muscleIndex) => (
                                  <Badge key={muscleIndex} variant="secondary" className="text-xs">
                                    {muscle}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Resfriamento:</h4>
                        <p className="text-sm text-foreground/70">{day.coolDown}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="nutrition" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dicas Nutricionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {workoutResult.workoutPlan.nutritionTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progression" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Como Progredir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {workoutResult.workoutPlan.progressionTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-medium">Frequência Semanal</h3>
                        <p className="text-2xl font-bold">{workoutResult.workoutPlan.schedule.length} dias</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-medium">Duração Média</h3>
                        <p className="text-2xl font-bold">{workoutResult.workoutPlan.duration}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}