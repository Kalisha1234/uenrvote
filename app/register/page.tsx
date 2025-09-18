
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Vote, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';
import { sendLoginCode } from '@/ai/flows/send-login-code';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const { addVoter } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const handleRegistrationSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const loginCode = await addVoter(values.email, values.fullName);
      
      const emailResult = await sendLoginCode({
        emailAddress: values.email,
        loginCode: loginCode,
      });

      if (emailResult.success) {
        setIsSuccess(true);
      } else {
        throw new Error(emailResult.message);
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: e.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="flex items-center gap-2 mb-6">
        <Vote className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary font-headline">UnerVote</h1>
      </div>
      <Card className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                  className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4"
                >
                  <CheckCircle className="h-8 w-8" />
                </motion.div>
                <CardTitle className="text-2xl font-headline">Registration Successful!</CardTitle>
                <CardDescription>
                  Your unique voting code has been sent to your email address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTitle className="font-semibold">Check Your Inbox</AlertTitle>
                  <AlertDescription>
                    Please use the code from the email to log in and cast your vote.
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full mt-6">
                  <Link href="/login">Return to Login</Link>
                </Button>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Voter Registration</CardTitle>
                <CardDescription>
                  Enter your details to receive a unique voting code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleRegistrationSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jane Doe" {...field} />
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., your_email@school.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Register and Get Code
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
                <p>
                  Already registered?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
