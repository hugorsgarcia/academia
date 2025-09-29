// src/ai/flows/workout-generator.ts
'use server';

/**
 * @fileOverview AI agent that generates personalized workout plans based on user profile.
 *
 * - generateWorkoutPlan - Generates a personalized workout plan
 * - WorkoutGeneratorInput - Input type for the workout generator
 * - WorkoutGeneratorOutput - Output type for the workout generator
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkoutGeneratorInputSchema = z.object({
  userProfile: z.object({
    age: z.number().min(13).max(100),
    gender: z.enum(['male', 'female', 'other']),
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    goals: z.array(z.enum(['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_fitness'])),
    availableDays: z.number().min(1).max(7),
    sessionDuration: z.number().min(15).max(180), // minutes
    injuries: z.array(z.string()).optional(),
    preferences: z.array(z.enum(['cardio', 'strength', 'functional', 'yoga', 'pilates', 'crossfit'])).optional(),
  }),
});

export type WorkoutGeneratorInput = z.infer<typeof WorkoutGeneratorInputSchema>;

const WorkoutGeneratorOutputSchema = z.object({
  workoutPlan: z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    schedule: z.array(z.object({
      day: z.string(),
      workoutType: z.string(),
      exercises: z.array(z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.string(), // Can be "10-12" or "30 seconds"
        rest: z.string(),
        instructions: z.string(),
        targetMuscles: z.array(z.string()),
      })),
      estimatedDuration: z.string(),
      warmUp: z.string(),
      coolDown: z.string(),
    })),
    nutritionTips: z.array(z.string()),
    progressionTips: z.array(z.string()),
  }),
});

export type WorkoutGeneratorOutput = z.infer<typeof WorkoutGeneratorOutputSchema>;

export async function generateWorkoutPlan(input: WorkoutGeneratorInput): Promise<WorkoutGeneratorOutput> {
  return workoutGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'workoutGeneratorPrompt',
  input: {schema: WorkoutGeneratorInputSchema},
  output: {schema: WorkoutGeneratorOutputSchema},
  prompt: `You are an expert personal trainer and fitness coach. Create a comprehensive, personalized workout plan based on the user's profile.

User Profile:
- Age: {{userProfile.age}}
- Gender: {{userProfile.gender}}
- Fitness Level: {{userProfile.fitnessLevel}}
- Goals: {{userProfile.goals}}
- Available Days: {{userProfile.availableDays}} days per week
- Session Duration: {{userProfile.sessionDuration}} minutes
- Injuries: {{userProfile.injuries}}
- Preferences: {{userProfile.preferences}}

Create a detailed workout plan that includes:
1. A structured weekly schedule
2. Specific exercises with sets, reps, and rest periods
3. Warm-up and cool-down recommendations
4. Nutrition tips aligned with their goals
5. Progression advice for continuous improvement

Make sure the plan is:
- Safe and appropriate for their fitness level
- Aligned with their goals and preferences
- Considerate of any injuries mentioned
- Realistic for their available time
- Progressive and sustainable

Respond in Portuguese (Brazilian) and use proper fitness terminology.`,
});

const workoutGeneratorFlow = ai.defineFlow(
  {
    name: 'workoutGeneratorFlow',
    inputSchema: WorkoutGeneratorInputSchema,
    outputSchema: WorkoutGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);