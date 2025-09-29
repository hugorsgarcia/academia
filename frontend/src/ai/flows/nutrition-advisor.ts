// src/ai/flows/nutrition-advisor.ts
'use server';

/**
 * @fileOverview AI agent that provides nutrition advice based on fitness goals.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionAdvisorInputSchema = z.object({
  userProfile: z.object({
    age: z.number().min(13).max(100),
    gender: z.enum(['male', 'female', 'other']),
    weight: z.number().min(30).max(300), // kg
    height: z.number().min(100).max(250), // cm
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
    goals: z.array(z.enum(['weight_loss', 'muscle_gain', 'maintenance', 'performance'])),
    dietaryRestrictions: z.array(z.string()).optional(),
    mealsPerDay: z.number().min(3).max(8),
  }),
});

export type NutritionAdvisorInput = z.infer<typeof NutritionAdvisorInputSchema>;

const NutritionAdvisorOutputSchema = z.object({
  nutritionPlan: z.object({
    dailyCalories: z.number(),
    macronutrients: z.object({
      protein: z.object({ grams: z.number(), percentage: z.number() }),
      carbs: z.object({ grams: z.number(), percentage: z.number() }),
      fats: z.object({ grams: z.number(), percentage: z.number() }),
    }),
    mealPlan: z.array(z.object({
      meal: z.string(),
      time: z.string(),
      foods: z.array(z.string()),
      calories: z.number(),
      tips: z.string(),
    })),
    supplementation: z.array(z.object({
      supplement: z.string(),
      dosage: z.string(),
      timing: z.string(),
      benefits: z.string(),
    })),
    hydration: z.object({
      dailyWater: z.string(),
      tips: z.array(z.string()),
    }),
    generalTips: z.array(z.string()),
  }),
});

export type NutritionAdvisorOutput = z.infer<typeof NutritionAdvisorOutputSchema>;

export async function getNutritionAdvice(input: NutritionAdvisorInput): Promise<NutritionAdvisorOutput> {
  return nutritionAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionAdvisorPrompt',
  input: {schema: NutritionAdvisorInputSchema},
  output: {schema: NutritionAdvisorOutputSchema},
  prompt: `You are a certified nutritionist and sports nutrition expert. Create a comprehensive nutrition plan based on the user's profile and fitness goals.

User Profile:
- Age: {{userProfile.age}}
- Gender: {{userProfile.gender}}
- Weight: {{userProfile.weight}} kg
- Height: {{userProfile.height}} cm
- Activity Level: {{userProfile.activityLevel}}
- Goals: {{userProfile.goals}}
- Dietary Restrictions: {{userProfile.dietaryRestrictions}}
- Preferred Meals Per Day: {{userProfile.mealsPerDay}}

Create a detailed nutrition plan that includes:
1. Calculated daily caloric needs
2. Optimal macronutrient distribution
3. Structured meal plan with food suggestions
4. Supplement recommendations (if appropriate)
5. Hydration guidelines
6. General nutrition tips

Make sure the plan is:
- Scientifically sound and evidence-based
- Aligned with their fitness goals
- Considerate of dietary restrictions
- Practical and sustainable
- Safe and appropriate for their profile

Respond in Portuguese (Brazilian) and use proper nutrition terminology. Include Brazilian foods and ingredients when possible.`,
});

const nutritionAdvisorFlow = ai.defineFlow(
  {
    name: 'nutritionAdvisorFlow',
    inputSchema: NutritionAdvisorInputSchema,
    outputSchema: NutritionAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);