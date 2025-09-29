// src/ai/flows/exercise-assistant.ts
'use server';

/**
 * @fileOverview AI agent that provides exercise guidance and form corrections.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExerciseAssistantInputSchema = z.object({
  query: z.string().describe('User question about exercise, form, or technique'),
  exerciseName: z.string().optional().describe('Specific exercise name if applicable'),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  equipmentAvailable: z.array(z.string()).optional().describe('Available equipment'),
});

export type ExerciseAssistantInput = z.infer<typeof ExerciseAssistantInputSchema>;

const ExerciseAssistantOutputSchema = z.object({
  response: z.object({
    answer: z.string(),
    exerciseDetails: z.object({
      name: z.string(),
      primaryMuscles: z.array(z.string()),
      secondaryMuscles: z.array(z.string()),
      equipment: z.array(z.string()),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      properForm: z.array(z.string()),
      commonMistakes: z.array(z.string()),
      variations: z.array(z.object({
        name: z.string(),
        difficulty: z.string(),
        description: z.string(),
      })),
      progressions: z.array(z.string()),
      safetyTips: z.array(z.string()),
    }).optional(),
    alternatives: z.array(z.object({
      name: z.string(),
      reason: z.string(),
      equipment: z.array(z.string()),
    })).optional(),
    videoSuggestions: z.array(z.string()).optional(),
  }),
});

export type ExerciseAssistantOutput = z.infer<typeof ExerciseAssistantOutputSchema>;

export async function getExerciseAssistance(input: ExerciseAssistantInput): Promise<ExerciseAssistantOutput> {
  return exerciseAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exerciseAssistantPrompt',
  input: {schema: ExerciseAssistantInputSchema},
  output: {schema: ExerciseAssistantOutputSchema},
  prompt: `You are an expert personal trainer and exercise physiologist. Help users with their exercise questions, providing detailed, accurate, and safe guidance.

User Query: {{query}}
Exercise Name (if specified): {{exerciseName}}
User Level: {{userLevel}}
Available Equipment: {{equipmentAvailable}}

Provide comprehensive assistance including:
1. A clear, helpful answer to their question
2. Detailed exercise information (if applicable)
3. Alternative exercises (if relevant)
4. Safety considerations
5. Form corrections and technique tips

Make sure your advice is:
- Safe and appropriate for their level
- Scientifically accurate
- Practical and actionable
- Considerate of available equipment
- Clear and easy to understand

If the user is asking about form or technique, be very specific about proper execution and common mistakes to avoid.

Respond in Portuguese (Brazilian) and use proper fitness terminology.`,
});

const exerciseAssistantFlow = ai.defineFlow(
  {
    name: 'exerciseAssistantFlow',
    inputSchema: ExerciseAssistantInputSchema,
    outputSchema: ExerciseAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);