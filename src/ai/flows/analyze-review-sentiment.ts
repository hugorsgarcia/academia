// src/ai/flows/analyze-review-sentiment.ts
'use server';

/**
 * @fileOverview AI agent that performs sentiment analysis on user reviews.
 *
 * - analyzeReviewSentiment - Analyzes the sentiment of a given review.
 * - AnalyzeReviewSentimentInput - Input type for the analyzeReviewSentiment function.
 * - AnalyzeReviewSentimentOutput - Output type for the analyzeReviewSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReviewSentimentInputSchema = z.object({
  reviewText: z
    .string()
    .describe('The text content of the review to be analyzed.'),
});
export type AnalyzeReviewSentimentInput = z.infer<typeof AnalyzeReviewSentimentInputSchema>;

const AnalyzeReviewSentimentOutputSchema = z.object({
  sentimentScore: z
    .number()
    .describe(
      'A numerical score between -1 and 1 indicating the sentiment of the review. -1 is very negative, 0 is neutral, and 1 is very positive.'
    ),
  sentimentLabel: z
    .string()
    .describe(
      'A descriptive label indicating the sentiment of the review (e.g., Positive, Negative, Neutral).'
    ),
  summary: z.string().describe('A brief summary of the review and its sentiment.'),
});
export type AnalyzeReviewSentimentOutput = z.infer<typeof AnalyzeReviewSentimentOutputSchema>;

export async function analyzeReviewSentiment(input: AnalyzeReviewSentimentInput): Promise<AnalyzeReviewSentimentOutput> {
  return analyzeReviewSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReviewSentimentPrompt',
  input: {schema: AnalyzeReviewSentimentInputSchema},
  output: {schema: AnalyzeReviewSentimentOutputSchema},
  prompt: `You are an AI specializing in sentiment analysis. Analyze the following review text and provide a sentiment score between -1 and 1, a sentiment label (Positive, Negative, or Neutral), and a brief summary.

Review Text: {{{reviewText}}}

Respond in the following JSON format:
{
  "sentimentScore": number,
  "sentimentLabel": string,
  "summary": string
}`,
});

const analyzeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeReviewSentimentFlow',
    inputSchema: AnalyzeReviewSentimentInputSchema,
    outputSchema: AnalyzeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
