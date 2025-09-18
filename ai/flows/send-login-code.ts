
'use server';

/**
 * @fileOverview Sends a unique login code to a voter's email address using SendGrid.
 *
 * - sendLoginCode - A function that handles the email sending process.
 * - SendLoginCodeInput - The input type for the sendLoginCode function.
 * - SendLoginCodeOutput - The return type for the sendLoginCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
const sgMail = require('@sendgrid/mail')

// Initialize SendGrid client at the module level
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.error('SENDGRID_API_KEY is not set. Email functionality will fail.');
} else {
  sgMail.setApiKey(apiKey);
}

const SendLoginCodeInputSchema = z.object({
  emailAddress: z.string().email().describe('The email address of the voter.'),
  loginCode: z.string().describe('The unique login code for the voter.'),
});
export type SendLoginCodeInput = z.infer<typeof SendLoginCodeInputSchema>;

const SendLoginCodeOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendLoginCodeOutput = z.infer<typeof SendLoginCodeOutputSchema>;

export async function sendLoginCode(input: SendLoginCodeInput): Promise<SendLoginCodeOutput> {
  return sendLoginCodeFlow(input);
}

const sendLoginCodeFlow = ai.defineFlow(
  {
    name: 'sendLoginCodeFlow',
    inputSchema: SendLoginCodeInputSchema,
    outputSchema: SendLoginCodeOutputSchema,
  },
  async (input) => {
    if (!apiKey) {
      return {
        success: false,
        message: 'SendGrid API Key is not configured on the server.',
      };
    }

    try {
      const msg = {
        to: input.emailAddress,
        // IMPORTANT: This must be a verified sender in your SendGrid account.
        from: 'godfred.kyeremeh.stu@uenr.edu.gh',
        subject: 'Your Student Government Election Login Code',
        text: `Your unique login code is: ${input.loginCode}`,
        html: `
          <p>Hello,</p>
          <p>Thank you for registering to vote in the student government election.</p>
          <p>Your unique login code is: <strong>${input.loginCode}</strong></p>
          <p>Please use this code to log in and cast your vote.</p>
        `,
      };

      await sgMail.send(msg);
      console.log(`Email sent to ${input.emailAddress}`);
      return {
        success: true,
        message: `Successfully sent login code to ${input.emailAddress}`,
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      let errorMessage = 'Failed to send the login code email.';
      // Extract more specific error message from SendGrid if available
      if (error.response && error.response.body && error.response.body.errors) {
        errorMessage = error.response.body.errors.map((e: { message: string }) => e.message).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
);
