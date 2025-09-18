'use server';

/**
 * @fileOverview Generates candidate bios and platform summaries using AI.
 *
 * - generateCandidateInfo - A function that generates candidate information.
 * - GenerateCandidateInfoInput - The input type for the generateCandidateInfo function.
 * - GenerateCandidateInfoOutput - The return type for the generateCandidateInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCandidateInfoInputSchema = z.object({
  candidateName: z.string().describe('The name of the candidate.'),
  position: z.string().describe('The position the candidate is running for.'),
  platformDetails: z.string().describe('Detailed information about the candidate\'s platform.'),
});
export type GenerateCandidateInfoInput = z.infer<typeof GenerateCandidateInfoInputSchema>;

const GenerateCandidateInfoOutputSchema = z.object({
  bio: z.string().describe('A short biography of the candidate.'),
  platformSummary: z.string().describe('A concise summary of the candidate\'s platform.'),
});
export type GenerateCandidateInfoOutput = z.infer<typeof GenerateCandidateInfoOutputSchema>;

export async function generateCandidateInfo(input: GenerateCandidateInfoInput): Promise<GenerateCandidateInfoOutput> {
  return generateCandidateInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCandidateInfoPrompt',
  input: {schema: GenerateCandidateInfoInputSchema},
  output: {schema: GenerateCandidateInfoOutputSchema},
  prompt: `You are an AI assistant that generates biographies and platform summaries for political candidates.

  Given the following information about a candidate, generate a short biography and a concise summary of their platform.

  Candidate Name: {{{candidateName}}}
  Position: {{{position}}}
  Platform Details: {{{platformDetails}}}

  Here's an example output:
  \`\`\`
  {
    "bio": "[Generated biography]",
    "platformSummary": "[Generated platform summary]"
  }
  \`\`\`
  Make sure to return a valid JSON. Do not return any other information.
  `,
});

const generateCandidateInfoFlow = ai.defineFlow(
  {
    name: 'generateCandidateInfoFlow',
    inputSchema: GenerateCandidateInfoInputSchema,
    outputSchema: GenerateCandidateInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
