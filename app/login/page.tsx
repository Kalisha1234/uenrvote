
import AdminLoginForm from '@/components/admin-login-form';
import LoginForm from '@/components/login-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="flex items-center gap-2 mb-6">
        <Vote className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary font-headline">UnerVote</h1>
      </div>
      <Tabs defaultValue="voter" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voter">Voter Login</TabsTrigger>
          <TabsTrigger value="admin">Admin Login</TabsTrigger>
        </TabsList>
        <TabsContent value="voter">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">Voter Login</CardTitle>
              <CardDescription>Please enter your unique code to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
              <CardDescription>Enter your administrator credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLoginForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
